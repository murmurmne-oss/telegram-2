import { Router } from 'express';
import { Response } from 'express';
import {
  AuthRequest,
  authenticateTelegram,
  requireAdmin,
  requireSuperAdmin,
} from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Применяем аутентификацию и проверку прав админа ко всем routes
router.use(authenticateTelegram);
router.use(requireAdmin);

/**
 * GET /api/admin/check-access
 * Проверка прав админа
 */
router.get(
  '/check-access',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
      },
    });

    res.json({
      success: true,
      data: {
        hasAccess: true,
        user,
      },
    });
  })
);

/**
 * GET /api/admin/dashboard
 * Статистика для админ-панели
 */
router.get(
  '/dashboard',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { period = '30' } = req.query;
    const daysAgo = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Общая статистика
    const [
      totalStudents,
      totalCourses,
      totalRevenue,
      newStudents,
      newPurchases,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: 'USER',
        },
      }),
      prisma.course.count({
        where: {
          isPublished: true,
        },
      }),
      prisma.purchase.aggregate({
        where: {
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.user.count({
        where: {
          role: 'USER',
          createdAt: {
            gte: startDate,
          },
        },
      }),
      prisma.purchase.count({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
          },
        },
      }),
    ]);

    // Доход за период
    const periodRevenue = await prisma.purchase.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Популярные курсы
    const popularCourses = await prisma.course.findMany({
      take: 5,
      orderBy: {
        enrollCount: 'desc',
      },
      select: {
        id: true,
        title: true,
        enrollCount: true,
        rating: true,
        price: true,
        coverImage: true,
        _count: {
          select: {
            purchases: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
    });

    // Последние покупки
    const recentPurchases = await prisma.purchase.findMany({
      take: 10,
      where: {
        status: 'COMPLETED',
      },
      orderBy: {
        completedAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Доход по дням за период
    const dailyRevenue = await prisma.$queryRaw<
      Array<{ date: Date; revenue: number; count: number }>
    >`
      SELECT
        DATE(completed_at) as date,
        SUM(amount)::numeric as revenue,
        COUNT(*)::int as count
      FROM purchases
      WHERE status = 'COMPLETED'
        AND completed_at >= ${startDate}
      GROUP BY DATE(completed_at)
      ORDER BY date ASC
    `;

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalCourses,
          totalRevenue: totalRevenue._sum.amount?.toString() || '0',
          newStudents,
          newPurchases,
          periodRevenue: periodRevenue._sum.amount?.toString() || '0',
        },
        popularCourses: popularCourses.map((course) => ({
          ...course,
          price: course.price.toString(),
          rating: course.rating?.toString(),
          purchasesCount: course._count.purchases,
        })),
        recentPurchases: recentPurchases.map((p) => ({
          id: p.id,
          amount: p.amount.toString(),
          completedAt: p.completedAt,
          user: p.user,
          course: p.course,
        })),
        dailyRevenue: dailyRevenue.map((d) => ({
          date: d.date,
          revenue: d.revenue.toString(),
          count: d.count,
        })),
      },
    });
  })
);

/**
 * POST /api/admin/courses
 * Создать курс
 */
router.post(
  '/courses',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      title,
      description,
      shortDesc,
      coverImage,
      previewVideo,
      price,
      discountPrice,
      categoryId,
      level,
      duration,
      slug,
      metaTitle,
      metaDescription,
      isPublished,
      tags,
    } = req.body;

    // Валидация
    if (!title || !description || !price || !categoryId || !slug) {
      throw new AppError(
        'Missing required fields: title, description, price, categoryId, slug',
        400
      );
    }

    // Проверка уникальности slug
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      throw new AppError('Course with this slug already exists', 400);
    }

    // Создание курса
    const course = await prisma.course.create({
      data: {
        title,
        description,
        shortDesc,
        coverImage,
        previewVideo,
        price,
        discountPrice,
        categoryId,
        level: level || 'BEGINNER',
        duration: duration || 0,
        slug,
        metaTitle,
        metaDescription,
        isPublished: isPublished || false,
      },
      include: {
        category: true,
      },
    });

    // Добавление тегов
    if (tags && Array.isArray(tags) && tags.length > 0) {
      await Promise.all(
        tags.map((tagId: string) =>
          prisma.courseTag.create({
            data: {
              courseId: course.id,
              tagId,
            },
          })
        )
      );
    }

    res.status(201).json({
      success: true,
      data: {
        course: {
          ...course,
          price: course.price.toString(),
          discountPrice: course.discountPrice?.toString(),
        },
      },
    });
  })
);

/**
 * PUT /api/admin/courses/:id
 * Обновить курс
 */
router.put(
  '/courses/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    // Проверка существования
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      throw new AppError('Course not found', 404);
    }

    // Проверка уникальности slug
    if (updateData.slug && updateData.slug !== existingCourse.slug) {
      const slugExists = await prisma.course.findUnique({
        where: { slug: updateData.slug },
      });

      if (slugExists) {
        throw new AppError('Course with this slug already exists', 400);
      }
    }

    // Обновление курса
    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    res.json({
      success: true,
      data: {
        course: {
          ...course,
          price: course.price.toString(),
          discountPrice: course.discountPrice?.toString(),
        },
      },
    });
  })
);

/**
 * DELETE /api/admin/courses/:id
 * Удалить курс
 */
router.delete(
  '/courses/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Проверка существования
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            purchases: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Проверка на наличие покупок
    if (course._count.purchases > 0) {
      throw new AppError(
        'Cannot delete course with existing purchases. Unpublish it instead.',
        400
      );
    }

    // Удаление курса (каскадно удалятся уроки и связи)
    await prisma.course.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  })
);

/**
 * POST /api/admin/courses/:courseId/lessons
 * Добавить урок к курсу
 */
router.post(
  '/courses/:courseId/lessons',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { courseId } = req.params;
    const {
      title,
      description,
      content,
      videoUrl,
      videoDuration,
      order,
      isFree,
      materials,
    } = req.body;

    // Валидация
    if (!title || order === undefined) {
      throw new AppError('Missing required fields: title, order', 400);
    }

    // Проверка существования курса
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Создание урока
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        content,
        videoUrl,
        videoDuration,
        order,
        isFree: isFree || false,
        courseId,
      },
    });

    // Добавление материалов
    if (materials && Array.isArray(materials) && materials.length > 0) {
      await Promise.all(
        materials.map((material: any) =>
          prisma.lessonMaterial.create({
            data: {
              title: material.title,
              type: material.type,
              url: material.url,
              fileSize: material.fileSize,
              lessonId: lesson.id,
            },
          })
        )
      );
    }

    res.status(201).json({
      success: true,
      data: { lesson },
    });
  })
);

/**
 * PUT /api/admin/lessons/:id
 * Обновить урок
 */
router.put(
  '/lessons/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    // Проверка существования
    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!existingLesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Обновление урока
    const lesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
      include: {
        materials: true,
      },
    });

    res.json({
      success: true,
      data: { lesson },
    });
  })
);

/**
 * DELETE /api/admin/lessons/:id
 * Удалить урок
 */
router.delete(
  '/lessons/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Проверка существования
    const lesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Удаление урока (каскадно удалятся материалы)
    await prisma.lesson.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  })
);

/**
 * POST /api/admin/promo-codes
 * Создать промокод
 */
router.post(
  '/promo-codes',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      code,
      type,
      value,
      minPurchaseAmount,
      maxUses,
      courseIds,
      validFrom,
      validUntil,
    } = req.body;

    // Валидация
    if (!code || !type || !value || !validFrom || !validUntil) {
      throw new AppError(
        'Missing required fields: code, type, value, validFrom, validUntil',
        400
      );
    }

    // Проверка уникальности кода
    const existingPromo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingPromo) {
      throw new AppError('Promo code already exists', 400);
    }

    // Создание промокода
    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        minPurchaseAmount,
        maxUses,
        courseIds: courseIds || [],
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        promoCode: {
          ...promoCode,
          minPurchaseAmount: promoCode.minPurchaseAmount?.toString(),
        },
      },
    });
  })
);

/**
 * GET /api/admin/users
 * Список пользователей
 */
router.get(
  '/users',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      page = '1',
      limit = '20',
      role,
      search,
      isBlocked,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked === 'true';
    }

    if (search) {
      where.OR = [
        { username: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          telegramId: true,
          username: true,
          firstName: true,
          lastName: true,
          photoUrl: true,
          role: true,
          isBlocked: true,
          isPremium: true,
          createdAt: true,
          _count: {
            select: {
              purchases: {
                where: {
                  status: 'COMPLETED',
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users: users.map((user) => ({
          ...user,
          telegramId: user.telegramId.toString(),
          purchasesCount: user._count.purchases,
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
 * PUT /api/admin/users/:id/role
 * Изменить роль пользователя (только для SUPER_ADMIN)
 */
router.put(
  '/users/:id/role',
  requireSuperAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    // Валидация роли
    if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Обновление роли
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    res.json({
      success: true,
      data: { user: updatedUser },
    });
  })
);

/**
 * PUT /api/admin/users/:id/block
 * Заблокировать/разблокировать пользователя
 */
router.put(
  '/users/:id/block',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { isBlocked } = req.body;

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Нельзя заблокировать админа
    if (user.role !== 'USER' && isBlocked) {
      throw new AppError('Cannot block admin users', 400);
    }

    // Обновление статуса
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        isBlocked: true,
      },
    });

    res.json({
      success: true,
      data: { user: updatedUser },
    });
  })
);

export default router;
