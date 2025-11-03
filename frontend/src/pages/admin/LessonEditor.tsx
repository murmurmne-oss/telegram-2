import { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { Lesson } from '@/types';

interface LessonEditorProps {
  lesson: Lesson | null;
  courseId: string;
  onSave: (lesson: Lesson) => void;
  onClose: () => void;
}

export default function LessonEditor({ lesson, courseId, onSave, onClose }: LessonEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    isPreview: false
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        description: lesson.description || '',
        videoUrl: lesson.videoUrl,
        duration: Math.floor(lesson.duration / 60), // Convert to minutes
        isPreview: lesson.isPreview
      });
    }
  }, [lesson]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lessonData: Lesson = {
      id: lesson?.id || Date.now().toString(),
      courseId,
      title: formData.title,
      description: formData.description,
      videoUrl: formData.videoUrl,
      duration: formData.duration * 60, // Convert to seconds
      order: lesson?.order || 1,
      isPreview: formData.isPreview,
      createdAt: lesson?.createdAt || new Date().toISOString()
    };

    onSave(lessonData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {lesson ? 'Редактировать урок' : 'Добавить урок'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название урока *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
              placeholder="Введение в React"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание урока
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
              placeholder="Краткое описание урока..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL видео *
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Поддерживаются YouTube, Vimeo и прямые ссылки на видео
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Длительность (минуты) *
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
              placeholder="30"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPreview"
              name="isPreview"
              checked={formData.isPreview}
              onChange={handleInputChange}
              className="w-4 h-4 text-[#F173A5] border-gray-300 rounded focus:ring-[#F173A5]"
            />
            <label htmlFor="isPreview" className="text-sm font-medium text-gray-700">
              Бесплатный preview (доступен всем)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#F173A5] to-[#FB3B00] text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              <FiSave className="w-4 h-4" />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
