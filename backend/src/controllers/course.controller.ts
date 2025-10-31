import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';

export class CourseController {
  /**
   * Получить список курсов
   */
  getCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      category,
      level,
      search,
      page = '1',
      limit = '12',
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isPublished: true,
    };

    // Фильтр по категории
    if (category) {
      where.categoryId = category;
    }

    // Фильтр по уровню
    if (level) {
      where.level = level;
    }

    // Поиск
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Получение курсов
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: { lessons: true, reviews: true, purchases: true },
          },
        },
        orderBy: { [sort as string]: order },
        skip,
        take: limitNum,
      }),
      prisma.course.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        courses: courses.map(course => ({
          ...course,
          price: course.price.toString(),
          discountPrice: course.discountPrice?.toString(),
          rating: course.rating?.toString(),
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  });

  /**
   * Получить детали курса
   */
  getCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
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
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { reviews: true, purchases: true },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Проверка доступа к курсу
    const hasPurchased = await prisma.purchase.findFirst({
      where: {
        userId: req.user!.id,
        courseId: course.id,
        status: 'COMPLETED',
      },
    });

    // Увеличить счетчик просмотров
    await prisma.course.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({
      success: true,
      data: {
        course: {
          ...course,
          price: course.price.toString(),
          discountPrice: course.discountPrice?.toString(),
          rating: course.rating?.toString(),
          hasPurchased: !!hasPurchased,
        },
      },
    });
  });

  /**
   * Получить уроки курса
   */
  getCourseLessons = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Проверка существования курса
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Проверка доступа
    const hasPurchased = await prisma.purchase.findFirst({
      where: {
        userId: req.user!.id,
        courseId: course.id,
        status: 'COMPLETED',
      },
    });

    const lessons = await prisma.lesson.findMany({
      where: {
        courseId: id,
        ...(hasPurchased ? {} : { isFree: true }), // Показываем все уроки если куплено
      },
      orderBy: { order: 'asc' },
      include: {
        materials: true,
      },
    });

    res.json({
      success: true,
      data: {
        lessons,
        hasPurchased: !!hasPurchased,
      },
    });
  });

  /**
   * Получить урок
   */
  getLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { courseId, lessonId } = req.params;

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        courseId,
      },
      include: {
        materials: true,
        course: true,
      },
    });

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Проверка доступа
    if (!lesson.isFree) {
      const hasPurchased = await prisma.purchase.findFirst({
        where: {
          userId: req.user!.id,
          courseId,
          status: 'COMPLETED',
        },
      });

      if (!hasPurchased) {
        throw new AppError('Purchase course to access this lesson', 403);
      }
    }

    res.json({
      success: true,
      data: { lesson },
    });
  });

  /**
   * Создать курс (ADMIN)
   */
  createCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
    const courseData = req.body;

    const course = await prisma.course.create({
      data: courseData,
      include: {
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { course },
    });
  });

  /**
   * Обновить курс (ADMIN)
   */
  updateCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const courseData = req.body;

    const course = await prisma.course.update({
      where: { id },
      data: courseData,
      include: {
        category: true,
      },
    });

    res.json({
      success: true,
      data: { course },
    });
  });

  /**
   * Удалить курс (ADMIN)
   */
  deleteCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    await prisma.course.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  });

  /**
   * Создать урок (ADMIN)
   */
  createLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id: courseId } = req.params;
    const lessonData = req.body;

    const lesson = await prisma.lesson.create({
      data: {
        ...lessonData,
        courseId,
      },
    });

    res.status(201).json({
      success: true,
      data: { lesson },
    });
  });

  /**
   * Обновить урок (ADMIN)
   */
  updateLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { lessonId } = req.params;
    const lessonData = req.body;

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: lessonData,
    });

    res.json({
      success: true,
      data: { lesson },
    });
  });

  /**
   * Удалить урок (ADMIN)
   */
  deleteLesson = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { lessonId } = req.params;

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  });
}
