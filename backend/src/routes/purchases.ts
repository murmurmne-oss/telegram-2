import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest, authenticateTelegram } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import crypto from 'crypto';

const router = Router();

/**
 * GET /api/purchases
 * История покупок пользователя
 */
router.get(
  '/',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page = '1', limit = '10', status } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      userId: req.user!.id,
    };

    if (status) {
      where.status = status;
    }

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              slug: true,
            },
          },
          promoCode: {
            select: {
              code: true,
              type: true,
              value: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.purchase.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        purchases: purchases.map((p) => ({
          id: p.id,
          course: p.course,
          amount: p.amount.toString(),
          currency: p.currency,
          status: p.status,
          discountAmount: p.discountAmount?.toString(),
          promoCode: p.promoCode,
          createdAt: p.createdAt,
          completedAt: p.completedAt,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  })
);

/**
 * GET /api/purchases/:id
 * Получить детали покупки
 */
router.get(
  '/:id',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const purchase = await prisma.purchase.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        course: true,
        promoCode: {
          select: {
            code: true,
            type: true,
            value: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new AppError('Purchase not found', 404);
    }

    res.json({
      success: true,
      data: {
        purchase: {
          ...purchase,
          amount: purchase.amount.toString(),
          discountAmount: purchase.discountAmount?.toString(),
          course: {
            ...purchase.course,
            price: purchase.course.price.toString(),
            discountPrice: purchase.course.discountPrice?.toString(),
          },
        },
      },
    });
  })
);

/**
 * POST /api/purchases/create-invoice
 * Создать invoice для Telegram Payments
 */
router.post(
  '/create-invoice',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { courseId, promoCode } = req.body;

    if (!courseId) {
      throw new AppError('Course ID is required', 400);
    }

    // Получение курса
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Проверка существующей покупки
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: req.user!.id,
        courseId,
        status: 'COMPLETED',
      },
    });

    if (existingPurchase) {
      throw new AppError('Course already purchased', 400);
    }

    let finalPrice = course.discountPrice || course.price;
    let promoCodeData = null;
    let discountAmount = 0;

    // Применение промокода
    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase() },
      });

      if (!promo) {
        throw new AppError('Invalid promo code', 400);
      }

      // Проверка промокода
      const now = new Date();
      if (!promo.isActive || promo.validFrom > now || promo.validUntil < now) {
        throw new AppError('Promo code expired or inactive', 400);
      }

      if (promo.maxUses && promo.usedCount >= promo.maxUses) {
        throw new AppError('Promo code usage limit reached', 400);
      }

      if (
        promo.courseIds.length > 0 &&
        !promo.courseIds.includes(course.id)
      ) {
        throw new AppError('Promo code not applicable to this course', 400);
      }

      if (
        promo.minPurchaseAmount &&
        finalPrice < promo.minPurchaseAmount
      ) {
        throw new AppError('Minimum purchase amount not met', 400);
      }

      // Расчет скидки
      if (promo.type === 'PERCENTAGE') {
        discountAmount = (Number(finalPrice) * promo.value) / 100;
      } else {
        discountAmount = promo.value;
      }

      finalPrice = Number(finalPrice) - discountAmount;
      promoCodeData = promo;
    }

    // Создание или обновление покупки
    const purchase = await prisma.purchase.upsert({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId,
        },
      },
      update: {
        amount: finalPrice,
        promoCodeId: promoCodeData?.id,
        discountAmount: discountAmount,
        status: 'PENDING',
      },
      create: {
        userId: req.user!.id,
        courseId,
        amount: finalPrice,
        currency: course.currency,
        promoCodeId: promoCodeData?.id,
        discountAmount: discountAmount,
        status: 'PENDING',
      },
    });

    // Генерация invoice для Telegram Stars или Telegram Payments
    // TODO: Интеграция с Telegram Bot API для создания invoice

    // Пример структуры invoice для Telegram
    const invoice = {
      title: course.title,
      description: course.shortDesc || course.description.substring(0, 100),
      payload: purchase.id, // ID покупки для webhook
      currency: 'XTR', // Telegram Stars или другая валюта
      prices: [
        {
          label: course.title,
          amount: Math.round(Number(finalPrice) * 100), // В копейках/центах
        },
      ],
    };

    // Если есть скидка, показываем её отдельно
    if (discountAmount > 0) {
      invoice.prices.unshift({
        label: `Discount (${promoCodeData?.code})`,
        amount: -Math.round(discountAmount * 100),
      });
      invoice.prices.unshift({
        label: 'Original Price',
        amount: Math.round(Number(course.price) * 100),
      });
    }

    res.json({
      success: true,
      data: {
        purchaseId: purchase.id,
        invoice,
        amount: finalPrice.toString(),
        currency: course.currency,
      },
    });
  })
);

/**
 * POST /api/purchases/webhook
 * Webhook для обработки платежей от Telegram
 */
router.post(
  '/webhook',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Валидация webhook от Telegram
    // TODO: Проверка подписи Telegram

    const { payload, status, paymentChargeId } = req.body;

    if (!payload) {
      throw new AppError('Invalid webhook data', 400);
    }

    // payload содержит ID покупки
    const purchaseId = payload;

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        course: true,
        promoCode: true,
      },
    });

    if (!purchase) {
      throw new AppError('Purchase not found', 404);
    }

    // Обработка успешного платежа
    if (status === 'success' || status === 'paid') {
      await prisma.$transaction(async (tx) => {
        // Обновление статуса покупки
        await tx.purchase.update({
          where: { id: purchaseId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            telegramPaymentChargeId: paymentChargeId,
          },
        });

        // Обновление счетчика курса
        await tx.course.update({
          where: { id: purchase.courseId },
          data: {
            enrollCount: { increment: 1 },
          },
        });

        // Обновление счетчика использования промокода
        if (purchase.promoCodeId) {
          await tx.promoCode.update({
            where: { id: purchase.promoCodeId },
            data: {
              usedCount: { increment: 1 },
            },
          });
        }

        // Создание прогресса курса
        await tx.courseProgress.upsert({
          where: {
            userId_courseId: {
              userId: purchase.userId,
              courseId: purchase.courseId,
            },
          },
          update: {},
          create: {
            userId: purchase.userId,
            courseId: purchase.courseId,
            progress: 0,
          },
        });
      });

      // TODO: Отправка уведомления пользователю в Telegram
      // TODO: Отправка welcome сообщения с доступом к курсу
    } else if (status === 'failed') {
      // Обработка неудачного платежа
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          status: 'FAILED',
        },
      });
    }

    res.json({
      success: true,
      message: 'Webhook processed',
    });
  })
);

/**
 * POST /api/purchases/:id/refund
 * Запрос возврата средств (только для администратора)
 */
router.post(
  '/:id/refund',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    // Проверка прав (только админ может делать возвраты)
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      throw new AppError('Access denied. Admin only', 403);
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        course: true,
        user: true,
      },
    });

    if (!purchase) {
      throw new AppError('Purchase not found', 404);
    }

    if (purchase.status !== 'COMPLETED') {
      throw new AppError('Only completed purchases can be refunded', 400);
    }

    // TODO: Интеграция с Telegram для возврата средств

    // Обновление статуса покупки
    await prisma.purchase.update({
      where: { id },
      data: {
        status: 'REFUNDED',
      },
    });

    // TODO: Отправка уведомления пользователю

    res.json({
      success: true,
      message: 'Refund processed successfully',
    });
  })
);

/**
 * POST /api/purchases/validate-promo
 * Валидация промокода без создания покупки
 */
router.post(
  '/validate-promo',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { promoCode, courseId } = req.body;

    if (!promoCode || !courseId) {
      throw new AppError('Promo code and course ID are required', 400);
    }

    // Получение курса
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Проверка промокода
    const promo = await prisma.promoCode.findUnique({
      where: { code: promoCode.toUpperCase() },
    });

    if (!promo) {
      throw new AppError('Invalid promo code', 400);
    }

    // Валидация промокода
    const now = new Date();
    const validationErrors = [];

    if (!promo.isActive) {
      validationErrors.push('Promo code is inactive');
    }

    if (promo.validFrom > now) {
      validationErrors.push('Promo code not yet valid');
    }

    if (promo.validUntil < now) {
      validationErrors.push('Promo code has expired');
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      validationErrors.push('Promo code usage limit reached');
    }

    if (promo.courseIds.length > 0 && !promo.courseIds.includes(course.id)) {
      validationErrors.push('Promo code not applicable to this course');
    }

    const finalPrice = course.discountPrice || course.price;
    if (promo.minPurchaseAmount && finalPrice < promo.minPurchaseAmount) {
      validationErrors.push(
        `Minimum purchase amount is ${promo.minPurchaseAmount.toString()}`
      );
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: validationErrors[0],
        errors: validationErrors,
      });
    }

    // Расчет скидки
    let discountAmount = 0;
    if (promo.type === 'PERCENTAGE') {
      discountAmount = (Number(finalPrice) * promo.value) / 100;
    } else {
      discountAmount = promo.value;
    }

    const discountedPrice = Number(finalPrice) - discountAmount;

    res.json({
      success: true,
      data: {
        isValid: true,
        promoCode: {
          code: promo.code,
          type: promo.type,
          value: promo.value,
        },
        originalPrice: finalPrice.toString(),
        discountAmount: discountAmount.toString(),
        finalPrice: discountedPrice.toString(),
      },
    });
  })
);

export default router;
