import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import CourseTable from '@/components/admin/CourseTable';
import { api } from '@/services/api';
import { Course } from '@/types';
import toast from 'react-hot-toast';

export default function CoursesList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, statusFilter]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/courses');
      setCourses(response.data.data);
    } catch (error) {
      toast.error('Ошибка загрузки курсов');
      // Заглушка для разработки
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Основы веб-разработки',
          description: 'Полный курс по веб-разработке',
          shortDescription: 'Изучите HTML, CSS и JavaScript',
          coverImage: 'https://picsum.photos/seed/course1/400/300',
          category: 'Программирование',
          level: 'beginner',
          price: 2990,
          finalPrice: 2990,
          rating: 4.8,
          reviewsCount: 156,
          studentsCount: 324,
          duration: '8 недель',
          lessonsCount: 42,
          instructor: {
            name: 'Иван Иванов',
            avatar: 'https://picsum.photos/seed/instructor1/100/100',
            bio: 'Опытный разработчик'
          },
          lessons: [],
          tags: ['HTML', 'CSS', 'JavaScript'],
          isPublished: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'React для начинающих',
          description: 'Изучите React с нуля',
          shortDescription: 'Современная разработка на React',
          coverImage: 'https://picsum.photos/seed/course2/400/300',
          category: 'Программирование',
          level: 'intermediate',
          price: 3990,
          finalPrice: 3990,
          rating: 4.9,
          reviewsCount: 203,
          studentsCount: 256,
          duration: '10 недель',
          lessonsCount: 35,
          instructor: {
            name: 'Мария Петрова',
            avatar: 'https://picsum.photos/seed/instructor2/100/100',
            bio: 'React разработчик'
          },
          lessons: [],
          tags: ['React', 'JavaScript'],
          isPublished: true,
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z'
        },
        {
          id: '3',
          title: 'TypeScript Advanced (Черновик)',
          description: 'Продвинутый TypeScript',
          shortDescription: 'Глубокое погружение в TypeScript',
          coverImage: 'https://picsum.photos/seed/course3/400/300',
          category: 'Программирование',
          level: 'advanced',
          price: 4990,
          finalPrice: 4990,
          rating: 0,
          reviewsCount: 0,
          studentsCount: 0,
          duration: '6 недель',
          lessonsCount: 28,
          instructor: {
            name: 'Алексей Смирнов',
            avatar: 'https://picsum.photos/seed/instructor3/100/100',
            bio: 'TypeScript эксперт'
          },
          lessons: [],
          tags: ['TypeScript'],
          isPublished: false,
          createdAt: '2024-02-01T10:00:00Z',
          updatedAt: '2024-02-01T10:00:00Z'
        }
      ];
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter === 'published') {
      filtered = filtered.filter(course => course.isPublished);
    } else if (statusFilter === 'draft') {
      filtered = filtered.filter(course => !course.isPublished);
    }

    setFilteredCourses(filtered);
  };

  const handleEdit = (course: Course) => {
    navigate(`/admin/courses/edit/${course.id}`);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот курс?')) return;

    try {
      await api.delete(`/admin/courses/${courseId}`);
      toast.success('Курс успешно удален');
      loadCourses();
    } catch (error) {
      toast.error('Ошибка удаления курса');
    }
  };

  const handleDuplicate = async (course: Course) => {
    try {
      await api.post(`/admin/courses/${course.id}/duplicate`);
      toast.success('Курс успешно дублирован');
      loadCourses();
    } catch (error) {
      toast.error('Ошибка дублирования курса');
    }
  };

  const handleView = (course: Course) => {
    navigate(`/courses/${course.id}`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Курсы</h1>
          <p className="text-gray-600 mt-2">Управление курсами платформы</p>
        </div>
        <button
          onClick={() => navigate('/admin/courses/create')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F173A5] to-[#FB3B00] text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
        >
          <FiPlus className="w-5 h-5" />
          Создать курс
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск курсов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
            >
              <option value="all">Все курсы</option>
              <option value="published">Опубликованные</option>
              <option value="draft">Черновики</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Всего курсов</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{courses.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Опубликовано</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {courses.filter(c => c.isPublished).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Черновики</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {courses.filter(c => !c.isPublished).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredCourses.length > 0 ? (
          <CourseTable
            courses={filteredCourses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onView={handleView}
          />
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">Курсы не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
