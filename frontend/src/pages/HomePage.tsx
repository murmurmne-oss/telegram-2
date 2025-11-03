import { useTelegram } from '@/hooks/useTelegram';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { user: tgUser } = useTelegram();
  const navigate = useNavigate();

  const userName = tgUser?.first_name || 'Guest';

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header with white flower background image - VISIBLE (NO opacity) */}
      <header className="relative bg-[#F173A5] overflow-hidden flex items-center justify-center" style={{ height: '280px' }}>
        {/* White flower background image - FULL VISIBILITY */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-center bg-contain bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: 'url(https://i.postimg.cc/tgtc7FJZ/Neutral-Black-And-White-Minimalist-Aesthetic-Modern-Simple-Laser-Hair-Removal-Instagram-Post.png)',
            opacity: 1,
            zIndex: 0
          }}
        ></div>

        <div className="max-w-md mx-auto relative z-10 text-center px-4">
          <h1 className="text-black text-3xl font-semibold mb-2">
            Hello, {userName}!
          </h1>
          <p className="text-black text-base">
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
          className="bg-[#F173A5] rounded-r-[50px] cursor-pointer active:scale-95 transition-transform shadow-md w-fit max-w-[220px] mb-6"
          style={{
            marginLeft: '-1rem',
            padding: '12px 32px'
          }}
          onClick={() => navigate('/courses')}
        >
          <p className="text-white text-2xl font-bold" style={{ lineHeight: '1.2' }}>
            New<br />To discover
          </p>
        </div>

        {/* Course Cards Carousel */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Popular Courses
          </h2>

          {/* Carousel Container */}
          <div
            className="flex gap-4 overflow-x-auto overflow-y-hidden no-scrollbar"
            style={{
              padding: '20px 16px',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              marginLeft: '-1rem',
              marginRight: '-1rem'
            }}
          >
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
                className="rounded-3xl overflow-hidden shadow-lg cursor-pointer active:scale-95 transition-transform flex-shrink-0"
                style={{
                  minWidth: '160px',
                  width: '160px',
                  height: '200px',
                  backgroundColor: course.bgColor,
                  scrollSnapAlign: 'start'
                }}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                {/* Image Section - Top 65% */}
                <div className="flex items-center justify-center" style={{ height: '65%' }}>
                  <img
                    src={course.image}
                    alt={course.title}
                    className="object-contain"
                    style={{ maxWidth: '80%', maxHeight: '80%' }}
                  />
                </div>

                {/* Text Section - Bottom 35% - Text lifted up */}
                <div
                  className="flex flex-col justify-start"
                  style={{
                    height: '35%',
                    padding: '16px 12px',
                    gap: '4px'
                  }}
                >
                  <h3 className="text-black text-base font-semibold m-0 leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-black text-xs m-0 leading-tight" style={{ opacity: 0.8 }}>
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
