import { useState } from 'react';
import { FiEdit2, FiTrash2, FiCopy, FiEye, FiMoreVertical } from 'react-icons/fi';
import { Course } from '@/types';

interface CourseTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onDuplicate: (course: Course) => void;
  onView: (course: Course) => void;
}

export default function CourseTable({
  courses,
  onEdit,
  onDelete,
  onDuplicate,
  onView
}: CourseTableProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (courseId: string) => {
    setActiveMenu(activeMenu === courseId ? null : courseId);
  };

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Опубликован
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Черновик
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Курс
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Категория
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Цена
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Студенты
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {course.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.lessonsCount} уроков
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {course.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {course.price === 0 ? 'Бесплатно' : `${course.price.toLocaleString()} ₽`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {course.studentsCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(course.isPublished)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative inline-block">
                  <button
                    onClick={() => toggleMenu(course.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiMoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {activeMenu === course.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => {
                          onView(course);
                          setActiveMenu(null);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiEye className="w-4 h-4" />
                        Просмотреть
                      </button>
                      <button
                        onClick={() => {
                          onEdit(course);
                          setActiveMenu(null);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Редактировать
                      </button>
                      <button
                        onClick={() => {
                          onDuplicate(course);
                          setActiveMenu(null);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiCopy className="w-4 h-4" />
                        Дублировать
                      </button>
                      <button
                        onClick={() => {
                          onDelete(course.id);
                          setActiveMenu(null);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
