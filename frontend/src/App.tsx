import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { useAuthStore } from './store/authStore';

// Pages
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonPage from './pages/LessonPage';
import MyCoursesPage from './pages/MyCoursesPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

// Components
import Layout from './components/common/Layout';
import LoadingScreen from './components/common/LoadingScreen';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const { webApp, isReady } = useTelegram();
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    // Инициализация Telegram WebApp
    if (webApp && isReady) {
      webApp.ready();
      webApp.expand();

      // Установка полноэкранного режима
      webApp.isClosingConfirmationEnabled = false;

      // Установка цветов темы (белый фон)
      webApp.setHeaderColor('#FFFFFF');
      webApp.setBackgroundColor('#FFFFFF');

      // Инициализация аутентификации
      initialize(webApp.initData);
    }
  }, [webApp, isReady, initialize]);

  if (!isReady || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />

        {/* Protected Routes */}
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute>
              <MyCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
