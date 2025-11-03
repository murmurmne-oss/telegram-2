import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest, authenticateTelegram } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import crypto from 'crypto';

const router = Router();

/**
 * Генерация номера сертификата
 */
function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CERT-${timestamp}-${random}`;
}

/**
 * Генерация URL сертификата
 * В реальном приложении здесь должна быть логика создания PDF или изображения
 */
function generateCertificateUrl(
  certificateNumber: string,
  userName: string,
  courseTitle: string
): string {
  // TODO: Интеграция с сервисом генерации сертификатов
  // Пример: https://api.example.com/certificates/generate

  // Временное решение: возвращаем URL с параметрами
  const baseUrl = process.env.CERTIFICATE_URL || 'https://example.com/certificates';
  const params = new URLSearchParams({
    number: certificateNumber,
    name: userName,
    course: courseTitle,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * GET /api/certificates
 * Получить все сертификаты пользователя
 */
router.get(
  '/',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const certificates = await prisma.certificate.findMany({
      where: {
        userId: req.user!.id,
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: {
        certificates: certificates.map((cert) => ({
          id: cert.id,
          courseId: cert.courseId,
          courseTitle: cert.courseTitle,
          certificateNumber: cert.certificateNumber,
          certificateUrl: cert.certificateUrl,
          issuedAt: cert.issuedAt,
        })),
      },
    });
  })
);

/**
 * GET /api/certificates/:courseId
 * Получить или сгенерировать сертификат по курсу
 */
router.get(
  '/:courseId',
  authenticateTelegram,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { courseId } = req.params;

    // Проверка существования курса
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
      },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Проверка покупки курса
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: req.user!.id,
        courseId,
        status: 'COMPLETED',
      },
    });

    if (!purchase) {
      throw new AppError('You must purchase the course first', 403);
    }

    // Проверка завершения курса
    const courseProgress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId,
        },
      },
    });

    if (!courseProgress || !courseProgress.isCompleted) {
      throw new AppError(
        'You must complete all lessons to get a certificate',
        403
      );
    }

    // Проверка существующего сертификата
    let certificate = await prisma.certificate.findFirst({
      where: {
        userId: req.user!.id,
        courseId,
      },
    });

    // Генерация нового сертификата если не существует
    if (!certificate) {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          firstName: true,
          lastName: true,
          username: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const userName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.username || 'Student';

      const certificateNumber = generateCertificateNumber();
      const certificateUrl = generateCertificateUrl(
        certificateNumber,
        userName,
        course.title
      );

      certificate = await prisma.certificate.create({
        data: {
          userId: req.user!.id,
          courseId,
          courseTitle: course.title,
          certificateNumber,
          certificateUrl,
        },
      });
    }

    res.json({
      success: true,
      data: {
        certificate: {
          id: certificate.id,
          courseId: certificate.courseId,
          courseTitle: certificate.courseTitle,
          certificateNumber: certificate.certificateNumber,
          certificateUrl: certificate.certificateUrl,
          issuedAt: certificate.issuedAt,
        },
      },
    });
  })
);

/**
 * GET /api/certificates/verify/:certificateNumber
 * Проверить подлинность сертификата (публичный endpoint)
 */
router.get(
  '/verify/:certificateNumber',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { certificateNumber } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: {
        certificateNumber,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }

    const userName =
      certificate.user.firstName && certificate.user.lastName
        ? `${certificate.user.firstName} ${certificate.user.lastName}`
        : certificate.user.username || 'Student';

    res.json({
      success: true,
      data: {
        isValid: true,
        certificate: {
          certificateNumber: certificate.certificateNumber,
          courseTitle: certificate.courseTitle,
          userName,
          issuedAt: certificate.issuedAt,
        },
      },
    });
  })
);

export default router;
