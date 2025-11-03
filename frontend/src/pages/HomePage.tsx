import { useTelegram } from '@/hooks/useTelegram';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { user: tgUser } = useTelegram();
  const navigate = useNavigate();

  const userName = tgUser?.first_name || 'Guest';

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header with white flower background */}
      <header className="relative bg-gradient-to-r from-[#F173A5] to-[#E91E63] px-4 pt-12 pb-16 overflow-hidden">
        {/* White flower background shape - larger */}
        <div className="absolute top-4 right-[-20px] w-[280px] h-[280px] bg-white/30 rounded-full blur-3xl"></div>
        <div className="absolute top-8 right-[-40px] w-[240px] h-[240px] bg-white/20 rounded-full blur-2xl"></div>

        <div className="max-w-md mx-auto relative z-10">
          <h1 className="text-white text-3xl font-semibold mb-2 drop-shadow-lg">
            Hello, {userName}!
          </h1>
          <p className="text-white/95 text-base">
            Welcome to Sexual Wellness world MUR MUR
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 pt-6 pb-28 max-w-md mx-auto">
        {/* Main Course Banner */}
        <div
          className="relative w-full mb-6 rounded-2xl overflow-hidden shadow-lg cursor-pointer active:scale-95 transition-transform"
          onClick={() => navigate('/courses/main')}
        >
          <img
            src="https://i.postimg.cc/hvSQcWwL/Neutral-Black-And-White-Minimalist-Aesthetic-Modern-Simple-Laser-Hair-Removal-Instagram-Post-1.png"
            alt="Main Course"
            className="w-full h-48 object-cover"
          />

          {/* Course Info Overlay with improved contrast */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="bg-[#F173A5]/95 backdrop-blur-sm rounded-xl p-3 inline-block">
              <p className="text-white/90 text-xs font-medium mb-1">
                Курс который проходит прямо сейчас!
              </p>
              <p className="text-white text-sm font-semibold">
                Основной курс - Азбука Секса
              </p>
            </div>
          </div>
        </div>

        {/* New To Discover Section */}
        <div
          className="bg-gradient-to-r from-[#F173A5] to-[#E91E63] rounded-r-3xl py-4 px-6 mb-6 cursor-pointer active:scale-95 transition-transform shadow-md w-[150px]"
          style={{ marginLeft: '-1rem' }}
          onClick={() => navigate('/courses')}
        >
          <p className="text-white text-lg font-semibold">
            New<br />To discover
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Popular Courses
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                id: 1,
                title: 'Course 1',
                subtitle: 'Description',
                image: 'https://i.postimg.cc/gj37dLxM/Dizajn-bez-nazvania-2.png',
                bgColor: '#F173A5',
              },
              {
                id: 2,
                title: 'Course 2',
                subtitle: 'Description',
                image: 'https://i.postimg.cc/QCqq0Q9D/Dizajn-bez-nazvania-6-removebg-preview.png',
                bgColor: '#FB3B00',
              },
              {
                id: 3,
                title: 'Course 3',
                subtitle: 'Description',
                image: 'https://i.postimg.cc/j2RHwD8z/Dizajn-bez-nazvania-7-removebg-preview.png',
                bgColor: '#D6DB00',
              },
            ].map((course) => (
              <div
                key={course.id}
                className="rounded-2xl overflow-hidden shadow-lg cursor-pointer active:scale-95 transition-transform"
                style={{ aspectRatio: '1/1' }}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                {/* Image Section - Top 70% */}
                <div
                  className="h-[70%] flex items-center justify-center p-3"
                  style={{ backgroundColor: course.bgColor }}
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Text Section - Bottom 30% */}
                <div className="h-[30%] bg-white flex flex-col justify-center px-2 py-1">
                  <p className="text-gray-800 text-[10px] font-semibold leading-tight mb-0.5">
                    {course.title}
                  </p>
                  <p className="text-gray-600 text-[8px] leading-tight">
                    {course.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>Explore our courses and start learning today!</p>
        </div>
      </div>
    </div>
  );
}
