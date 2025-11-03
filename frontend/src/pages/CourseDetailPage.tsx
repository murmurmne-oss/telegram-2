import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course, Review } from '@/types';
import { useTelegram } from '@/hooks/useTelegram';
import api from '@/services/api';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user: tgUser } = useTelegram();

  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarCourses, setSimilarCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [courseRes, reviewsRes, similarRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/reviews`),
        api.get(`/courses/${courseId}/similar`),
      ]);

      setCourse(courseRes.data);
      setReviews(reviewsRes.data);
      setSimilarCourses(similarRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load course details');
      console.error('Error fetching course details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!course) return;

    try {
      setPurchasing(true);
      const response = await api.post(`/courses/${courseId}/purchase`);

      // Redirect to payment or update course status
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        // Course purchased successfully
        setCourse({ ...course, isPurchased: true });
        navigate(`/courses/${courseId}/lessons/${course.lessons[0]?.id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to purchase course');
    } finally {
      setPurchasing(false);
    }
  };

  const handleStartLearning = () => {
    if (!course || !course.lessons[0]) return;
    navigate(`/courses/${courseId}/lessons/${course.lessons[0].id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-64"></div>
          <div className="p-4 space-y-4">
            <div className="bg-gray-200 h-8 rounded"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            <p className="font-semibold">Error loading course</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="bg-[#F173A5] text-white px-6 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Course Cover */}
      <div className="relative h-64 bg-gradient-to-br from-[#F173A5] to-[#FB3B00]">
        <img
          src={course.coverImage}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full active:scale-95 transition-transform"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Discount Badge */}
        {course.discount && (
          <div className="absolute top-4 right-4 bg-[#D6DB00] text-black px-3 py-1 rounded-full text-sm font-bold">
            -{course.discount}%
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="p-6">
        {/* Title and Rating */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{course.title}</h1>
          <p className="text-gray-600 text-sm mb-3">{course.shortDescription}</p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span className="font-semibold text-gray-800">{course.rating.toFixed(1)}</span>
              <span className="text-gray-500">({course.reviewsCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>{course.studentsCount} students</span>
            </div>
          </div>
        </div>

        {/* Course Meta */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-50 p-3 rounded-xl text-center">
            <div className="text-[#F173A5] font-bold text-lg">{course.lessonsCount}</div>
            <div className="text-gray-600 text-xs">Lessons</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl text-center">
            <div className="text-[#FB3B00] font-bold text-lg capitalize">{course.level}</div>
            <div className="text-gray-600 text-xs">Level</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl text-center">
            <div className="text-[#D6DB00] font-bold text-lg">{course.duration}</div>
            <div className="text-gray-600 text-xs">Duration</div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">About this course</h2>
          <p className="text-gray-600 leading-relaxed">{course.description}</p>
        </div>

        {/* Instructor */}
        <div className="mb-6 bg-gray-50 p-4 rounded-xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Instructor</h2>
          <div className="flex items-center gap-3">
            {course.instructor.avatar ? (
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#F173A5] flex items-center justify-center text-white font-semibold">
                {course.instructor.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{course.instructor.name}</h3>
              {course.instructor.bio && (
                <p className="text-sm text-gray-600 line-clamp-2">{course.instructor.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Course Content</h2>
          <div className="space-y-2">
            {course.lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="bg-gray-50 p-4 rounded-xl flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#F173A5] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 text-sm truncate">{lesson.title}</h3>
                  <p className="text-xs text-gray-500">{formatDuration(lesson.duration)}</p>
                </div>
                {lesson.isPreview && (
                  <span className="text-xs text-[#F173A5] font-semibold">Preview</span>
                )}
                {!course.isPurchased && !lesson.isPreview && (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Student Reviews</h2>
            <div className="space-y-3">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    {review.user.photoUrl ? (
                      <img
                        src={review.user.photoUrl}
                        alt={review.user.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#FB3B00] flex items-center justify-center text-white font-semibold">
                        {review.user.firstName.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm">{review.user.firstName}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Courses */}
        {similarCourses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Similar Courses</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
              {similarCourses.map((similarCourse) => (
                <div
                  key={similarCourse.id}
                  onClick={() => navigate(`/courses/${similarCourse.id}`)}
                  className="flex-shrink-0 w-40 cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="rounded-xl overflow-hidden shadow-md mb-2">
                    <img
                      src={similarCourse.coverImage}
                      alt={similarCourse.title}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1">
                    {similarCourse.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#F173A5]">
                      {formatPrice(similarCourse.finalPrice)}
                    </span>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-xs text-gray-600">{similarCourse.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            {course.discount ? (
              <>
                <div className="text-2xl font-bold text-[#F173A5]">
                  {formatPrice(course.finalPrice)}
                </div>
                <div className="text-sm text-gray-400 line-through">
                  {formatPrice(course.price)}
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-gray-800">
                {formatPrice(course.price)}
              </div>
            )}
          </div>

          {course.isPurchased ? (
            <button
              onClick={handleStartLearning}
              className="bg-[#F173A5] text-white px-8 py-3 rounded-xl font-semibold active:scale-95 transition-transform flex-1"
            >
              Continue Learning
            </button>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="bg-[#F173A5] text-white px-8 py-3 rounded-xl font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              {purchasing ? 'Processing...' : 'Buy Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
