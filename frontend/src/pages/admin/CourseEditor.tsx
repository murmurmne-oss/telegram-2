import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiEye, FiArrowLeft, FiPlus, FiTrash2, FiMove } from 'react-icons/fi';
import { api } from '@/services/api';
import { Course, Lesson } from '@/types';
import toast from 'react-hot-toast';
import LessonEditor from './LessonEditor';

interface CourseFormData {
  title: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  duration: string;
  instructorName: string;
  instructorBio: string;
  instructorAvatar: string;
  tags: string;
}

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    shortDescription: '',
    description: '',
    coverImage: '',
    category: '',
    level: 'beginner',
    price: 0,
    duration: '',
    instructorName: '',
    instructorBio: '',
    instructorAvatar: '',
    tags: ''
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showLessonEditor, setShowLessonEditor] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isEdit) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/courses/${id}`);
      const course: Course = response.data.data;

      setFormData({
        title: course.title,
        shortDescription: course.shortDescription || '',
        description: course.description,
        coverImage: course.coverImage,
        category: course.category,
        level: course.level,
        price: course.price,
        duration: course.duration,
        instructorName: course.instructor.name,
        instructorBio: course.instructor.bio || '',
        instructorAvatar: course.instructor.avatar || '',
        tags: course.tags.join(', ')
      });

      setLessons(course.lessons || []);
    } catch (error) {
      toast.error('Ошибка загрузки курса');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    // Предпросмотр
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        coverImage: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.coverImage;

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', imageFile);

      const response = await api.post('/admin/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.data.url;
    } catch (error) {
      toast.error('Ошибка загрузки изображения');
      return formData.coverImage;
    }
  };

  const handleSaveDraft = async () => {
    await saveCourse(false);
  };

  const handlePublish = async () => {
    await saveCourse(true);
  };

  const saveCourse = async (publish: boolean) => {
    try {
      setLoading(true);

      // Валидация
      if (!formData.title || !formData.description || !formData.category) {
        toast.error('Заполните обязательные поля');
        return;
      }

      // Загрузка изображения если нужно
      const coverImageUrl = await uploadImage();

      const courseData = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        description: formData.description,
        coverImage: coverImageUrl,
        category: formData.category,
        level: formData.level,
        price: Number(formData.price),
        duration: formData.duration,
        instructor: {
          name: formData.instructorName,
          bio: formData.instructorBio,
          avatar: formData.instructorAvatar
        },
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        lessons: lessons,
        isPublished: publish
      };

      if (isEdit) {
        await api.put(`/admin/courses/${id}`, courseData);
        toast.success(publish ? 'Курс опубликован' : 'Курс сохранен');
      } else {
        const response = await api.post('/admin/courses', courseData);
        toast.success(publish ? 'Курс создан и опубликован' : 'Курс создан как черновик');
        navigate(`/admin/courses/edit/${response.data.data.id}`);
      }
    } catch (error) {
      toast.error('Ошибка сохранения курса');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = () => {
    setEditingLesson(null);
    setShowLessonEditor(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowLessonEditor(true);
  };

  const handleSaveLesson = (lesson: Lesson) => {
    if (editingLesson) {
      // Обновление существующего урока
      setLessons(prev => prev.map(l => l.id === lesson.id ? lesson : l));
    } else {
      // Добавление нового урока
      setLessons(prev => [...prev, { ...lesson, id: Date.now().toString(), order: prev.length + 1 }]);
    }
    setShowLessonEditor(false);
    setEditingLesson(null);
    toast.success('Урок сохранен');
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!confirm('Удалить урок?')) return;
    setLessons(prev => prev.filter(l => l.id !== lessonId));
    toast.success('Урок удален');
  };

  const moveLessonUp = (index: number) => {
    if (index === 0) return;
    const newLessons = [...lessons];
    [newLessons[index], newLessons[index - 1]] = [newLessons[index - 1], newLessons[index]];
    newLessons.forEach((lesson, idx) => lesson.order = idx + 1);
    setLessons(newLessons);
  };

  const moveLessonDown = (index: number) => {
    if (index === lessons.length - 1) return;
    const newLessons = [...lessons];
    [newLessons[index], newLessons[index + 1]] = [newLessons[index + 1], newLessons[index]];
    newLessons.forEach((lesson, idx) => lesson.order = idx + 1);
    setLessons(newLessons);
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F173A5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/courses')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Редактировать курс' : 'Создать курс'}
            </h1>
            <p className="text-gray-600 mt-2">Заполните информацию о курсе</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FiSave className="w-5 h-5" />
            Сохранить черновик
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F173A5] to-[#FB3B00] text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <FiEye className="w-5 h-5" />
            Опубликовать
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Основная информация</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название курса *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
              placeholder="Например: Основы веб-разработки"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Краткое описание
            </label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
              placeholder="Краткое описание для карточки курса"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Полное описание *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
              placeholder="Подробное описание курса..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Обложка курса
            </label>
            <div className="flex items-center gap-4">
              {formData.coverImage && (
                <img
                  src={formData.coverImage}
                  alt="Preview"
                  className="w-32 h-24 object-cover rounded-lg"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Рекомендуемый размер: 800x600px
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
              >
                <option value="">Выберите категорию</option>
                <option value="Программирование">Программирование</option>
                <option value="Дизайн">Дизайн</option>
                <option value="Маркетинг">Маркетинг</option>
                <option value="Бизнес">Бизнес</option>
                <option value="Фотография">Фотография</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Уровень
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
              >
                <option value="beginner">Начальный</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена (₽)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Длительность
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
                placeholder="Например: 8 недель"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Теги (через запятую)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
                placeholder="HTML, CSS, JavaScript"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Instructor Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Информация о преподавателе</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имя преподавателя
            </label>
            <input
              type="text"
              name="instructorName"
              value={formData.instructorName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
              placeholder="Иван Иванов"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Биография
            </label>
            <textarea
              name="instructorBio"
              value={formData.instructorBio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
              placeholder="Краткая информация о преподавателе..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL аватара
            </label>
            <input
              type="text"
              name="instructorAvatar"
              value={formData.instructorAvatar}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Уроки ({lessons.length})
          </h2>
          <button
            onClick={handleAddLesson}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F173A5] to-[#FB3B00] text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            <FiPlus className="w-4 h-4" />
            Добавить урок
          </button>
        </div>

        {lessons.length > 0 ? (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#F173A5] transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveLessonUp(index)}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveLessonDown(index)}
                    disabled={index === lessons.length - 1}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {lesson.order}. {lesson.title}
                    </span>
                    {lesson.isPreview && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                        Превью
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {Math.floor(lesson.duration / 60)} мин
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditLesson(lesson)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiMove className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Уроки еще не добавлены</p>
            <p className="text-sm mt-1">Нажмите "Добавить урок" для создания первого урока</p>
          </div>
        )}
      </div>

      {/* Lesson Editor Modal */}
      {showLessonEditor && (
        <LessonEditor
          lesson={editingLesson}
          courseId={id || ''}
          onSave={handleSaveLesson}
          onClose={() => {
            setShowLessonEditor(false);
            setEditingLesson(null);
          }}
        />
      )}
    </div>
  );
}
