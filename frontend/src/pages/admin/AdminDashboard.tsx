import { useEffect, useState } from 'react';
import { FiUsers, FiBook, FiDollarSign, FiShoppingCart } from 'react-icons/fi';
import StatsCard from '@/components/admin/StatsCard';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  totalSales: number;
  studentsChange: number;
  coursesChange: number;
  revenueChange: number;
  salesChange: number;
}

interface PopularCourse {
  id: string;
  title: string;
  students: number;
  revenue: number;
}

interface RecentActivity {
  id: string;
  type: 'purchase' | 'registration' | 'course_created';
  description: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [popularCourses, setPopularCourses] = useState<PopularCourse[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes, activitiesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/popular-courses'),
        api.get('/admin/recent-activities')
      ]);

      setStats(statsRes.data.data);
      setPopularCourses(coursesRes.data.data);
      setRecentActivities(activitiesRes.data.data);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
      // Заглушки для разработки
      setStats({
        totalStudents: 1234,
        totalCourses: 42,
        totalRevenue: 567890,
        totalSales: 892,
        studentsChange: 12.5,
        coursesChange: 5.2,
        revenueChange: 18.7,
        salesChange: 8.3
      });
      setPopularCourses([
        { id: '1', title: 'Основы веб-разработки', students: 324, revenue: 45600 },
        { id: '2', title: 'React для начинающих', students: 256, revenue: 38400 },
        { id: '3', title: 'TypeScript Advanced', students: 189, revenue: 28350 }
      ]);
      setRecentActivities([
        { id: '1', type: 'purchase', description: 'Новая покупка курса "Основы веб-разработки"', timestamp: '5 минут назад' },
        { id: '2', type: 'registration', description: 'Новый пользователь зарегистрировался', timestamp: '12 минут назад' },
        { id: '3', type: 'course_created', description: 'Создан курс "Vue.js для профи"', timestamp: '1 час назад' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F173A5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Главная панель</h1>
        <p className="text-gray-600 mt-2">Обзор основных метрик и активности</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Всего студентов"
          value={stats?.totalStudents || 0}
          icon={FiUsers}
          change={{ value: stats?.studentsChange || 0, trend: 'up' }}
          gradient="from-[#F173A5] to-[#FB3B00]"
        />
        <StatsCard
          title="Всего курсов"
          value={stats?.totalCourses || 0}
          icon={FiBook}
          change={{ value: stats?.coursesChange || 0, trend: 'up' }}
          gradient="from-[#FB3B00] to-[#D6DB00]"
        />
        <StatsCard
          title="Общий доход"
          value={`${(stats?.totalRevenue || 0).toLocaleString()} ₽`}
          icon={FiDollarSign}
          change={{ value: stats?.revenueChange || 0, trend: 'up' }}
          gradient="from-[#D6DB00] to-[#F173A5]"
        />
        <StatsCard
          title="Всего продаж"
          value={stats?.totalSales || 0}
          icon={FiShoppingCart}
          change={{ value: stats?.salesChange || 0, trend: 'up' }}
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Популярные курсы
          </h2>
          <div className="space-y-4">
            {popularCourses.map((course, index) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F173A5] to-[#FB3B00] flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.students} студентов</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {course.revenue.toLocaleString()} ₽
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Последние активности
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${activity.type === 'purchase' ? 'bg-green-100' : ''}
                  ${activity.type === 'registration' ? 'bg-blue-100' : ''}
                  ${activity.type === 'course_created' ? 'bg-purple-100' : ''}
                `}>
                  {activity.type === 'purchase' && <FiShoppingCart className="text-green-600" />}
                  {activity.type === 'registration' && <FiUsers className="text-blue-600" />}
                  {activity.type === 'course_created' && <FiBook className="text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Быстрые действия
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#F173A5] transition-colors text-left">
            <FiBook className="w-6 h-6 text-[#F173A5] mb-2" />
            <h3 className="font-medium text-gray-900">Создать курс</h3>
            <p className="text-sm text-gray-600 mt-1">Добавить новый курс</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#FB3B00] transition-colors text-left">
            <FiUsers className="w-6 h-6 text-[#FB3B00] mb-2" />
            <h3 className="font-medium text-gray-900">Пользователи</h3>
            <p className="text-sm text-gray-600 mt-1">Управление пользователями</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#D6DB00] transition-colors text-left">
            <FiDollarSign className="w-6 h-6 text-[#D6DB00] mb-2" />
            <h3 className="font-medium text-gray-900">Промокоды</h3>
            <p className="text-sm text-gray-600 mt-1">Создать промокод</p>
          </button>
        </div>
      </div>
    </div>
  );
}
