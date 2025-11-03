import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseProgress } from '@/types';
import { useTelegram } from '@/hooks/useTelegram';
import api from '@/services/api';

type TabType = 'in-progress' | 'completed';

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const { user: tgUser } = useTelegram();

  const [activeTab, setActiveTab] = useState<TabType>('in-progress');
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/user/courses');
      setCourses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const inProgressCourses = courses.filter((c) => !c.completedAt);
  const completedCourses = courses.filter((c) => c.completedAt);

  const displayedCourses = activeTab === 'in-progress' ? inProgressCourses : completedCourses;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-[#F173A5] p-6 pb-8">
        <h1 className="text-2xl font-bold text-white mb-2">My Courses</h1>
        <p className="text-white/90 text-sm">Track your learning progress</p>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'in-progress'
                ? 'text-[#F173A5]'
                : 'text-gray-500'
            }`}
          >
            In Progress ({inProgressCourses.length})
            {activeTab === 'in-progress' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F173A5]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'completed'
                ? 'text-[#F173A5]'
                : 'text-gray-500'
            }`}
          >
            Completed ({completedCourses.length})
            {activeTab === 'completed' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F173A5]"></div>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-32"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
              <p className="font-semibold">Error loading courses</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={fetchMyCourses}
              className="bg-[#F173A5] text-white px-6 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayedCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'in-progress' ? (
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {activeTab === 'in-progress' ? 'No courses in progress' : 'No completed courses'}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'in-progress'
                ? 'Start learning by purchasing a course'
                : 'Complete a course to see it here'}
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-[#F173A5] text-white px-6 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
            >
              Browse Courses
            </button>
          </div>
        )}

        {/* Courses List */}
        {!loading && !error && displayedCourses.length > 0 && (
          <div className="space-y-4">
            {displayedCourses.map((courseProgress) => {
              const course = courseProgress.course;
              const bgColors = ['#F173A5', '#FB3B00', '#D6DB00'];
              const bgColor = bgColors[Math.floor(Math.random() * bgColors.length)];

              return (
                <div
                  key={courseProgress.courseId}
                  onClick={() => {
                    if (activeTab === 'completed' && courseProgress.certificate) {
                      // Navigate to certificate view
                      navigate(`/certificates/${courseProgress.certificate.id}`);
                    } else {
                      // Continue learning
                      const nextLesson = course.lessons.find(
                        (l) => !courseProgress.completedLessons.includes(l.id)
                      ) || course.lessons[0];
                      navigate(`/courses/${courseProgress.courseId}/lessons/${nextLesson.id}`);
                    }
                  }}
                  className="bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer active:scale-[0.98] transition-transform"
                >
                  {/* Course Header */}
                  <div className="flex items-start gap-4 p-4">
                    <div
                      className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden"
                      style={{ backgroundColor: bgColor }}
                    >
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <span>{course.lessonsCount} lessons</span>
                        <span>•</span>
                        <span>{course.duration}</span>
                      </div>

                      {activeTab === 'completed' ? (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-green-600 font-medium">
                            Completed on {formatDate(courseProgress.completedAt!)}
                          </span>
                        </div>
                      ) : (
                        <>
                          {/* Progress Bar */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Progress</span>
                              <span className="font-semibold">{Math.round(courseProgress.progress)}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#F173A5] to-[#FB3B00] transition-all duration-300"
                                style={{ width: `${courseProgress.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500">
                            {courseProgress.completedLessons.length} of {courseProgress.totalLessons} lessons completed
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-4 pb-4">
                    {activeTab === 'completed' ? (
                      <button
                        className="w-full bg-gradient-to-r from-[#F173A5] to-[#FB3B00] text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
                      >
                        {courseProgress.certificate ? 'View Certificate' : 'Review Course'}
                      </button>
                    ) : (
                      <button
                        className="w-full bg-[#F173A5] text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
                      >
                        Continue Learning
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statistics Card */}
      {!loading && !error && courses.length > 0 && (
        <div className="p-4">
          <div className="bg-gradient-to-br from-[#F173A5] to-[#FB3B00] rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Your Learning Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{courses.length}</div>
                <div className="text-sm text-white/80">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{completedCourses.length}</div>
                <div className="text-sm text-white/80">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {courses.reduce((sum, c) => sum + c.completedLessons.length, 0)}
                </div>
                <div className="text-sm text-white/80">Lessons Done</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
