import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course, Lesson } from '@/types';
import api from '@/services/api';

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLessonsList, setShowLessonsList] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (courseId && lessonId) {
      fetchLessonData();
    }
  }, [courseId, lessonId]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [courseRes, lessonRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/lessons/${lessonId}`),
      ]);

      setCourse(courseRes.data);
      setCurrentLesson(lessonRes.data);
      setIsCompleted(lessonRes.data.isCompleted || false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load lesson');
      console.error('Error fetching lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!courseId || !lessonId) return;

    try {
      await api.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
      setIsCompleted(true);

      // Show completion message
      alert('Lesson completed! Great job!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to mark lesson as completed');
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const navigateToLesson = (lesson: Lesson) => {
    navigate(`/courses/${courseId}/lessons/${lesson.id}`);
    setShowLessonsList(false);
  };

  const getCurrentLessonIndex = () => {
    if (!course || !currentLesson) return -1;
    return course.lessons.findIndex((l) => l.id === currentLesson.id);
  };

  const getNextLesson = () => {
    if (!course) return null;
    const currentIndex = getCurrentLessonIndex();
    return course.lessons[currentIndex + 1] || null;
  };

  const getPreviousLesson = () => {
    if (!course) return null;
    const currentIndex = getCurrentLessonIndex();
    return currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F173A5]"></div>
      </div>
    );
  }

  if (error || !course || !currentLesson) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            <p className="font-semibold">Error loading lesson</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="bg-[#F173A5] text-white px-6 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = getCurrentLessonIndex();
  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={currentLesson.videoUrl}
          controls
          controlsList="nodownload"
          className="w-full aspect-video"
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          poster={course.coverImage}
        >
          Your browser does not support the video tag.
        </video>

        {/* Back Button */}
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm p-2 rounded-full active:scale-95 transition-transform z-10"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white min-h-screen">
        {/* Lesson Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-[#F173A5] bg-[#F173A5]/10 px-2 py-1 rounded-full">
                  Lesson {currentIndex + 1} of {course.lessons.length}
                </span>
                {isCompleted && (
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Completed
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-2">{currentLesson.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{formatDuration(currentLesson.duration)}</span>
                <span>•</span>
                <span>{course.instructor.name}</span>
              </div>
            </div>
          </div>

          {/* Complete Button */}
          {!isCompleted && (
            <button
              onClick={handleMarkAsCompleted}
              className="w-full bg-[#F173A5] text-white py-3 rounded-xl font-semibold active:scale-95 transition-transform"
            >
              Mark as Completed
            </button>
          )}
        </div>

        {/* Description */}
        {currentLesson.description && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">About this lesson</h2>
            <p className="text-gray-600 leading-relaxed">{currentLesson.description}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            {previousLesson ? (
              <button
                onClick={() => navigateToLesson(previousLesson)}
                className="flex-1 bg-gray-100 text-gray-800 py-3 px-4 rounded-xl font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            ) : (
              <div className="flex-1"></div>
            )}

            {nextLesson ? (
              <button
                onClick={() => navigateToLesson(nextLesson)}
                className="flex-1 bg-[#F173A5] text-white py-3 px-4 rounded-xl font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="flex-1 bg-gradient-to-r from-[#F173A5] to-[#FB3B00] text-white py-3 px-4 rounded-xl font-semibold active:scale-95 transition-transform"
              >
                Finish Course
              </button>
            )}
          </div>
        </div>

        {/* Course Content List */}
        <div className="p-6">
          <button
            onClick={() => setShowLessonsList(!showLessonsList)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-lg font-semibold text-gray-800">Course Content</h2>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${showLessonsList ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showLessonsList && (
            <div className="space-y-2">
              {course.lessons.map((lesson, index) => {
                const isCurrent = lesson.id === currentLesson.id;
                const isLocked = !course.isPurchased && !lesson.isPreview;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => !isLocked && navigateToLesson(lesson)}
                    disabled={isLocked}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-[#F173A5] text-white'
                        : isLocked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                          isCurrent
                            ? 'bg-white/30 text-white'
                            : lesson.isCompleted
                            ? 'bg-green-500 text-white'
                            : isLocked
                            ? 'bg-gray-300 text-gray-500'
                            : 'bg-[#F173A5] text-white'
                        }`}
                      >
                        {lesson.isCompleted ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{lesson.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs opacity-80">{formatDuration(lesson.duration)}</p>
                          {lesson.isPreview && (
                            <span className="text-xs font-semibold">• Preview</span>
                          )}
                        </div>
                      </div>
                      {isLocked && (
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Course Info Footer */}
        <div className="p-6 bg-gray-50">
          <div
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F173A5] flex-shrink-0">
              <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Currently Learning</p>
              <h3 className="font-semibold text-gray-800 truncate">{course.title}</h3>
              <p className="text-xs text-gray-600">
                {course.lessons.filter((l) => l.isCompleted).length} of {course.lessons.length} lessons completed
              </p>
            </div>
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
