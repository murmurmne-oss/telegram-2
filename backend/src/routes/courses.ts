import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest, authenticateTelegram } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/courses
 * Получить все курсы с фильтрами
 */
router.get(
  '/',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      category,
      level,
      search,
      sort = 'createdAt',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Построение фильтров
    const where: any = {
      isPublished: true,
    };

    if (category) {
      where.categoryId = category;
    }

    if (level) {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { shortDesc: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Сортировка
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price') {
      orderBy = { price: 'asc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'popular') {
      orderBy = { enrollCount: 'desc' };
    }

    // Получение данных
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              color: true,
            },
          },
          _count: {
            select: {
              lessons: true,
              reviews: true,
              purchases: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.course.count({ where }),
    ]);

    // Проверка покупок пользователя
    const userPurchases = await prisma.purchase.findMany({
      where: {
        userId: req.user!.id,
        status: 'COMPLETED',
      },
      select: {
        courseId: true,
      },
    });

    const purchasedCourseIds = new Set(userPurchases.map((p) => p.courseId));

    // Форматирование ответа
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      shortDesc: course.shortDesc,
      coverImage: course.coverImage,
      previewVideo: course.previewVideo,
      price: course.price.toString(),
      discountPrice: course.discountPrice?.toString(),
      currency: course.currency,
      level: course.level,
      duration: course.duration,
      rating: course.rating?.toString(),
      reviewCount: course.reviewCount,
      enrollCount: course.enrollCount,
      category: course.category,
      lessonsCount: course._count.lessons,
      isPurchased: purchasedCourseIds.has(course.id),
      slug: course.slug,
    }));

    res.json({
      success: true,
      data: {
        courses: formattedCourses,
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
 * GET /api/courses/my-courses
 * Получить купленные курсы пользователя
 */
router.get(
  '/my-courses',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: req.user!.id,
        status: 'COMPLETED',
      },
      include: {
        course: {
          include: {
            category: true,
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Получение прогресса по курсам
    const progressData = await prisma.courseProgress.findMany({
      where: {
        userId: req.user!.id,
        courseId: {
          in: purchases.map((p) => p.courseId),
        },
      },
    });

    const progressMap = new Map(progressData.map((p) => [p.courseId, p]));

    const myCourses = purchases.map((purchase) => ({
      id: purchase.course.id,
      title: purchase.course.title,
      description: purchase.course.description,
      coverImage: purchase.course.coverImage,
      category: purchase.course.category,
      lessonsCount: purchase.course._count.lessons,
      purchasedAt: purchase.completedAt,
      progress: progressMap.get(purchase.courseId)?.progress || 0,
      isCompleted: progressMap.get(purchase.courseId)?.isCompleted || false,
    }));

    res.json({
      success: true,
      data: {
        courses: myCourses,
      },
    });
  })
);

/**
 * GET /api/courses/:id
 * Получить один курс по ID
 */
router.get(
  '/:id',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            isFree: true,
            videoDuration: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            reviews: true,
            purchases: true,
          },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Проверка покупки
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: req.user!.id,
        courseId: course.id,
        status: 'COMPLETED',
      },
    });

    // Обновление счетчика просмотров
    await prisma.course.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          shortDesc: course.shortDesc,
          coverImage: course.coverImage,
          previewVideo: course.previewVideo,
          price: course.price.toString(),
          discountPrice: course.discountPrice?.toString(),
          currency: course.currency,
          level: course.level,
          duration: course.duration,
          rating: course.rating?.toString(),
          reviewCount: course.reviewCount,
          enrollCount: course.enrollCount,
          viewCount: course.viewCount,
          category: course.category,
          lessons: course.lessons,
          isPurchased: !!purchase,
          slug: course.slug,
        },
      },
    });
  })
);

/**
 * GET /api/courses/:id/lessons
 * Получить список уроков курса
 */
router.get(
  '/:id/lessons',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Проверка доступа
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: req.user!.id,
        courseId: course.id,
        status: 'COMPLETED',
      },
    });

    const isPurchased = !!purchase;

    // Получение уроков
    const lessons = await prisma.lesson.findMany({
      where: {
        courseId: id,
        ...(isPurchased ? {} : { isFree: true }),
      },
      include: {
        materials: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Получение прогресса
    let progressData = null;
    if (isPurchased) {
      const courseProgress = await prisma.courseProgress.findUnique({
        where: {
          userId_courseId: {
            userId: req.user!.id,
            courseId: id,
          },
        },
        include: {
          lessons: true,
        },
      });

      if (courseProgress) {
        const progressMap = new Map(
          courseProgress.lessons.map((l) => [l.lessonId, l])
        );

        progressData = lessons.map((lesson) => ({
          lessonId: lesson.id,
          isCompleted: progressMap.get(lesson.id)?.isCompleted || false,
          watchTime: progressMap.get(lesson.id)?.watchTime || 0,
        }));
      }
    }

    res.json({
      success: true,
      data: {
        lessons,
        isPurchased,
        progress: progressData,
      },
    });
  })
);

/**
 * GET /api/courses/:id/progress
 * Получить прогресс по курсу
 */
router.get(
  '/:id/progress',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Проверка доступа
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: req.user!.id,
        courseId: id,
        status: 'COMPLETED',
      },
    });

    if (!purchase) {
      throw new AppError('Course not purchased', 403);
    }

    // Получение прогресса
    let courseProgress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId: id,
        },
      },
      include: {
        lessons: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                order: true,
              },
            },
          },
          orderBy: {
            lesson: {
              order: 'asc',
            },
          },
        },
      },
    });

    // Создание прогресса если не существует
    if (!courseProgress) {
      courseProgress = await prisma.courseProgress.create({
        data: {
          userId: req.user!.id,
          courseId: id,
          progress: 0,
        },
        include: {
          lessons: {
            include: {
              lesson: {
                select: {
                  id: true,
                  title: true,
                  order: true,
                },
              },
            },
          },
        },
      });
    }

    res.json({
      success: true,
      data: {
        progress: courseProgress.progress,
        isCompleted: courseProgress.isCompleted,
        startedAt: courseProgress.startedAt,
        completedAt: courseProgress.completedAt,
        lessons: courseProgress.lessons.map((lp) => ({
          lessonId: lp.lessonId,
          title: lp.lesson.title,
          order: lp.lesson.order,
          isCompleted: lp.isCompleted,
          watchTime: lp.watchTime,
          notes: lp.notes,
        })),
      },
    });
  })
);

/**
 * POST /api/courses/:id/purchase
 * Купить курс (с промокодом)
 */
router.post(
  '/:id/purchase',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { promoCode } = req.body;

    // Проверка курса
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Проверка существующей покупки
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: req.user!.id,
        courseId: id,
      },
    });

    if (existingPurchase && existingPurchase.status === 'COMPLETED') {
      throw new AppError('Course already purchased', 400);
    }

    let finalPrice = course.discountPrice || course.price;
    let promoCodeData = null;
    let discountAmount = 0;

    // Применение промокода
    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode },
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
    const purchase = existingPurchase
      ? await prisma.purchase.update({
          where: { id: existingPurchase.id },
          data: {
            amount: finalPrice,
            promoCodeId: promoCodeData?.id,
            discountAmount: discountAmount,
            status: 'PENDING',
          },
        })
      : await prisma.purchase.create({
          data: {
            userId: req.user!.id,
            courseId: id,
            amount: finalPrice,
            currency: course.currency,
            promoCodeId: promoCodeData?.id,
            discountAmount: discountAmount,
            status: 'PENDING',
          },
        });

    res.json({
      success: true,
      data: {
        purchase: {
          id: purchase.id,
          amount: purchase.amount.toString(),
          currency: purchase.currency,
          discountAmount: purchase.discountAmount?.toString(),
        },
      },
    });
  })
);

/**
 * POST /api/courses/:id/reviews
 * Оставить отзыв
 */
router.post(
  '/:id/reviews',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Валидация
    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Проверка покупки
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: req.user!.id,
        courseId: id,
        status: 'COMPLETED',
      },
    });

    if (!purchase) {
      throw new AppError('You must purchase the course to leave a review', 403);
    }

    // Создание или обновление отзыва
    const review = await prisma.review.upsert({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId: id,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId: req.user!.id,
        courseId: id,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            photoUrl: true,
          },
        },
      },
    });

    // Обновление рейтинга курса
    const reviews = await prisma.review.findMany({
      where: { courseId: id, isVisible: true },
    });

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.course.update({
      where: { id },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    });

    res.status(201).json({
      success: true,
      data: { review },
    });
  })
);

/**
 * GET /api/courses/:id/reviews
 * Получить отзывы курса
 */
router.get(
  '/:id/reviews',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          courseId: id,
          isVisible: true,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              photoUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.review.count({
        where: {
          courseId: id,
          isVisible: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        reviews,
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

export default router;
