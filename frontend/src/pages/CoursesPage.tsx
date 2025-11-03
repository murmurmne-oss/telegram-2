import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Course, CourseFilters } from '@/types';
import api from '@/services/api';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<CourseFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    sort: (searchParams.get('sort') as any) || 'popular',
  });

  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Relationships', 'Intimacy', 'Self-Care', 'Communication', 'Psychology'];
  const levels = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/courses', { params: filters });
      setCourses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CourseFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const newFilters = { search: '', category: '', level: '', sort: 'popular' as const };
    setFilters(newFilters);
    setSearchParams(new URLSearchParams());
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-[#F173A5] p-6 pb-8">
        <h1 className="text-2xl font-bold text-white mb-4">All Courses</h1>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-3 pr-10 rounded-xl border-none outline-none text-gray-800 placeholder-gray-400"
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-3 w-full bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters & Sort
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleFilterChange('category', filters.category === cat ? '' : cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.category === cat
                      ? 'bg-[#F173A5] text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
            <div className="flex flex-wrap gap-2">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleFilterChange('level', filters.level === lvl ? '' : lvl)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                    filters.level === lvl
                      ? 'bg-[#FB3B00] text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-[#F173A5]"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium active:scale-95 transition-transform"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-48 mb-3"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
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
              onClick={fetchCourses}
              className="bg-[#F173A5] text-white px-6 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
            {(filters.search || filters.category || filters.level) && (
              <button
                onClick={clearFilters}
                className="bg-[#F173A5] text-white px-6 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && courses.length > 0 && (
          <>
            <div className="text-sm text-gray-500 mb-4">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'} found
            </div>
            <div className="grid grid-cols-2 gap-4">
              {courses.map((course) => {
                const bgColors = ['#F173A5', '#FB3B00', '#D6DB00'];
                const bgColor = bgColors[Math.floor(Math.random() * bgColors.length)];

                return (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="rounded-2xl overflow-hidden shadow-lg cursor-pointer active:scale-95 transition-transform"
                    style={{ backgroundColor: bgColor }}
                  >
                    {/* Image Section */}
                    <div className="aspect-square flex items-center justify-center p-4">
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    {/* Content Section */}
                    <div className="bg-white p-3">
                      <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                        {course.title}
                      </h3>

                      <div className="flex items-center gap-1 mb-2">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-600">
                          {course.rating.toFixed(1)} ({course.reviewsCount})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        {course.discount ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#F173A5]">
                              {formatPrice(course.finalPrice)}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(course.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-gray-800">
                            {formatPrice(course.price)}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{course.lessonsCount} lessons</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
