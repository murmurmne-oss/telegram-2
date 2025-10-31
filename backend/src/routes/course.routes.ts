import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticateJWT, requireAdmin } from '../middleware/auth';

const router = Router();
const courseController = new CourseController();

// Публичные роуты (с аутентификацией)
router.get('/', authenticateJWT, courseController.getCourses);
router.get('/:id', authenticateJWT, courseController.getCourse);
router.get('/:id/lessons', authenticateJWT, courseController.getCourseLessons);
router.get('/:courseId/lessons/:lessonId', authenticateJWT, courseController.getLesson);

// Админ роуты
router.post('/', authenticateJWT, requireAdmin, courseController.createCourse);
router.put('/:id', authenticateJWT, requireAdmin, courseController.updateCourse);
router.delete('/:id', authenticateJWT, requireAdmin, courseController.deleteCourse);
router.post('/:id/lessons', authenticateJWT, requireAdmin, courseController.createLesson);
router.put('/:id/lessons/:lessonId', authenticateJWT, requireAdmin, courseController.updateLesson);
router.delete('/:id/lessons/:lessonId', authenticateJWT, requireAdmin, courseController.deleteLesson);

export default router;
