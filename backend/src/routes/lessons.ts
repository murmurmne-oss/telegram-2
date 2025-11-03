import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest, authenticateTelegram } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/lessons/:id
 * Получить урок по ID
 */
router.get(
  '/:id',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        materials: true,
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            discountPrice: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Проверка доступа к уроку
    if (!lesson.isFree) {
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: req.user!.id,
          courseId: lesson.courseId,
          status: 'COMPLETED',
        },
      });

      if (!purchase) {
        throw new AppError('Purchase course to access this lesson', 403);
      }
    }

    // Получение прогресса урока
    let lessonProgress = null;
    const courseProgress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId: lesson.courseId,
        },
      },
    });

    if (courseProgress) {
      lessonProgress = await prisma.lessonProgress.findUnique({
        where: {
          courseProgressId_lessonId: {
            courseProgressId: courseProgress.id,
            lessonId: lesson.id,
          },
        },
      });
    }

    res.json({
      success: true,
      data: {
        lesson: {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          videoDuration: lesson.videoDuration,
          order: lesson.order,
          isFree: lesson.isFree,
          materials: lesson.materials,
          course: lesson.course,
        },
        progress: lessonProgress
          ? {
              isCompleted: lessonProgress.isCompleted,
              watchTime: lessonProgress.watchTime,
              notes: lessonProgress.notes,
            }
          : null,
      },
    });
  })
);

/**
 * POST /api/lessons/:id/progress
 * Обновить прогресс урока
 */
router.post(
  '/:id/progress',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { watchTime, isCompleted, notes } = req.body;

    // Получение урока
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            lessons: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Проверка доступа
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: req.user!.id,
        courseId: lesson.courseId,
        status: 'COMPLETED',
      },
    });

    if (!purchase) {
      throw new AppError('Purchase course to track progress', 403);
    }

    // Получение или создание прогресса курса
    let courseProgress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId: lesson.courseId,
        },
      },
      include: {
        lessons: true,
      },
    });

    if (!courseProgress) {
      courseProgress = await prisma.courseProgress.create({
        data: {
          userId: req.user!.id,
          courseId: lesson.courseId,
          progress: 0,
        },
        include: {
          lessons: true,
        },
      });
    }

    // Обновление прогресса урока
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        courseProgressId_lessonId: {
          courseProgressId: courseProgress.id,
          lessonId: id,
        },
      },
      update: {
        watchTime: watchTime !== undefined ? watchTime : undefined,
        isCompleted: isCompleted !== undefined ? isCompleted : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
      create: {
        courseProgressId: courseProgress.id,
        lessonId: id,
        watchTime: watchTime || 0,
        isCompleted: isCompleted || false,
        notes: notes || null,
      },
    });

    // Пересчет прогресса курса
    const allLessonsProgress = await prisma.lessonProgress.findMany({
      where: {
        courseProgressId: courseProgress.id,
      },
    });

    const totalLessons = lesson.course.lessons.length;
    const completedLessons = allLessonsProgress.filter(
      (lp) => lp.isCompleted
    ).length;
    const progressPercentage = Math.round(
      (completedLessons / totalLessons) * 100
    );

    // Обновление прогресса курса
    const updatedCourseProgress = await prisma.courseProgress.update({
      where: { id: courseProgress.id },
      data: {
        progress: progressPercentage,
        isCompleted: progressPercentage === 100,
        completedAt: progressPercentage === 100 ? new Date() : null,
      },
    });

    res.json({
      success: true,
      data: {
        lessonProgress,
        courseProgress: {
          progress: updatedCourseProgress.progress,
          isCompleted: updatedCourseProgress.isCompleted,
        },
      },
    });
  })
);

/**
 * GET /api/lessons/:id/next
 * Получить следующий урок
 */
router.get(
  '/:id/next',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Получение текущего урока
    const currentLesson = await prisma.lesson.findUnique({
      where: { id },
      select: {
        courseId: true,
        order: true,
      },
    });

    if (!currentLesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Проверка доступа
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: req.user!.id,
        courseId: currentLesson.courseId,
        status: 'COMPLETED',
      },
    });

    if (!purchase) {
      throw new AppError('Purchase course to access lessons', 403);
    }

    // Поиск следующего урока
    const nextLesson = await prisma.lesson.findFirst({
      where: {
        courseId: currentLesson.courseId,
        order: {
          gt: currentLesson.order,
        },
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        materials: true,
      },
    });

    if (!nextLesson) {
      // Курс завершен
      res.json({
        success: true,
        data: {
          nextLesson: null,
          isLastLesson: true,
        },
      });
      return;
    }

    // Получение прогресса следующего урока
    let lessonProgress = null;
    const courseProgress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId: currentLesson.courseId,
        },
      },
    });

    if (courseProgress) {
      lessonProgress = await prisma.lessonProgress.findUnique({
        where: {
          courseProgressId_lessonId: {
            courseProgressId: courseProgress.id,
            lessonId: nextLesson.id,
          },
        },
      });
    }

    res.json({
      success: true,
      data: {
        nextLesson: {
          id: nextLesson.id,
          title: nextLesson.title,
          description: nextLesson.description,
          order: nextLesson.order,
          videoDuration: nextLesson.videoDuration,
          materials: nextLesson.materials,
        },
        progress: lessonProgress
          ? {
              isCompleted: lessonProgress.isCompleted,
              watchTime: lessonProgress.watchTime,
            }
          : null,
        isLastLesson: false,
      },
    });
  })
);

export default router;
