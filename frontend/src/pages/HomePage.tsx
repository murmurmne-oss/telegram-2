import { useTelegram } from '@/hooks/useTelegram';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { user: tgUser } = useTelegram();
  const navigate = useNavigate();

  const userName = tgUser?.first_name || 'Guest';

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Compact Header */}
      <header className="bg-gradient-to-r from-[#F173A5] to-[#E91E63] px-4 pt-6 pb-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-2xl font-semibold mb-1">
            Hello, {userName}! 👋
          </h1>
          <p className="text-white/90 text-sm">
            Welcome to Sexual Wellness world MUR MUR
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
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
          className="bg-gradient-to-r from-[#F173A5] to-[#E91E63] rounded-r-3xl py-4 px-6 mb-6 cursor-pointer active:scale-95 transition-transform shadow-md"
          style={{ marginLeft: '-1rem' }}
          onClick={() => navigate('/courses')}
        >
          <p className="text-white text-lg font-semibold">
            New<br />To discover 🔥
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
              },
              {
                id: 2,
                title: 'Course 2',
                subtitle: 'Description',
                image: 'https://i.postimg.cc/QCqq0Q9D/Dizajn-bez-nazvania-6-removebg-preview.png',
              },
              {
                id: 3,
                title: 'Course 3',
                subtitle: 'Description',
                image: 'https://i.postimg.cc/j2RHwD8z/Dizajn-bez-nazvania-7-removebg-preview.png',
              },
            ].map((course) => (
              <div
                key={course.id}
                className="relative bg-gradient-to-br from-[#F173A5] to-[#E91E63] rounded-2xl overflow-hidden shadow-lg cursor-pointer active:scale-95 transition-transform border border-black/10"
                style={{ aspectRatio: '1/1' }}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                {/* Semi-transparent overlay for better text contrast */}
                <div className="absolute inset-0 bg-black/20 z-0"></div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-3">
                  <div className="text-center">
                    <p className="text-white text-xs font-semibold drop-shadow-lg mb-1">
                      {course.title}
                    </p>
                    <p className="text-white/90 text-[10px] drop-shadow-md">
                      {course.subtitle}
                    </p>
                  </div>

                  <div className="flex justify-center items-end">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-16 h-16 object-contain drop-shadow-xl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>Explore our courses and start learning today! 📚</p>
        </div>
      </div>
    </div>
  );
}
