import { useAuthStore } from '@/store/authStore';
import { useTelegram } from '@/hooks/useTelegram';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { user } = useAuthStore();
  const { user: tgUser } = useTelegram();
  const navigate = useNavigate();

  const userName = user?.firstName || tgUser?.first_name || 'Guest';

  // Три дополнительных курса
  const additionalCourses = [
    {
      id: 1,
      title: 'Курс 1',
      subtitle: 'Описание',
      image: 'https://i.postimg.cc/gj37dLxM/Dizajn-bez-nazvania-2.png',
    },
    {
      id: 2,
      title: 'Курс 2',
      subtitle: 'Описание',
      image: 'https://i.postimg.cc/QCqq0Q9D/Dizajn-bez-nazvania-6-removebg-preview.png',
    },
    {
      id: 3,
      title: 'Курс 3',
      subtitle: 'Описание',
      image: 'https://i.postimg.cc/j2RHwD8z/Dizajn-bez-nazvania-7-removebg-preview.png',
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header
        className="relative w-full overflow-hidden"
        style={{
          height: '262px',
          backgroundColor: '#F173A5',
        }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <img
            src="https://i.postimg.cc/tgtc7FJZ/Neutral-Black-And-White-Minimalist-Aesthetic-Modern-Simple-Laser-Hair-Removal-Instagram-Post.png"
            alt="Header Background"
            className="w-full h-full object-cover"
            style={{
              maxWidth: '394px',
              maxHeight: '492px',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Text Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <h1
            className="text-center mb-2"
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 600,
              fontSize: '24px',
              color: '#000000',
            }}
          >
            Hello, {userName}
          </h1>
          <p
            className="text-center"
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 500,
              fontSize: '14px',
              color: '#000000',
            }}
          >
            Welcome to Sexual Wellness world MUR MUR
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-4">
        {/* Current Course Card */}
        <div
          className="relative w-full mx-auto cursor-pointer"
          style={{ maxWidth: '321px' }}
          onClick={() => navigate('/courses/main')}
        >
          <img
            src="https://i.postimg.cc/hvSQcWwL/Neutral-Black-And-White-Minimalist-Aesthetic-Modern-Simple-Laser-Hair-Removal-Instagram-Post-1.png"
            alt="Main Course"
            className="w-full h-auto object-cover"
            style={{
              borderRadius: '10px',
              maxWidth: '321px',
              height: '210px',
            }}
          />

          {/* Course Info Overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center px-4"
            style={{
              height: '51px',
              backgroundColor: '#F173A5',
              borderBottomRightRadius: '20px',
              borderBottomLeftRadius: '10px',
              mixBlendMode: 'difference',
              opacity: 1,
              maxWidth: '243px',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'Montserrat',
                  fontWeight: 500,
                  fontSize: '10px',
                  color: '#F9F6DC',
                  marginBottom: '2px',
                }}
              >
                Курс который проходит прямо сейчас!
              </p>
              <p
                style={{
                  fontFamily: 'Montserrat',
                  fontWeight: 600,
                  fontSize: '12px',
                  color: '#F9F6DC',
                }}
              >
                Основной курс - Азбука Секса
              </p>
            </div>
          </div>
        </div>

        {/* "New To Discover" Badge */}
        <div
          className="cursor-pointer"
          style={{
            width: '162px',
            height: '56px',
            backgroundColor: '#F173A5',
            borderTopLeftRadius: '0px',
            borderBottomLeftRadius: '0px',
            borderTopRightRadius: '30px',
            borderBottomRightRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px',
          }}
          onClick={() => navigate('/courses')}
        >
          <p
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 400,
              fontSize: '16px',
              color: '#000000',
              lineHeight: '1.2',
            }}
          >
            New<br />To discover
          </p>
        </div>

        {/* Additional Courses Grid */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {additionalCourses.map((course) => (
            <div
              key={course.id}
              className="flex-shrink-0 cursor-pointer relative"
              style={{
                width: '124px',
                height: '124px',
                backgroundColor: '#F173A5',
                borderRadius: '30px',
                border: '1px solid #000000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
              }}
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div className="text-center">
                <p
                  style={{
                    fontFamily: 'Montserrat',
                    fontWeight: 400,
                    fontSize: '11px',
                    color: '#000000',
                    marginBottom: '4px',
                  }}
                >
                  {course.title}
                </p>
                <p
                  style={{
                    fontFamily: 'Montserrat',
                    fontWeight: 400,
                    fontSize: '8px',
                    color: '#000000',
                  }}
                >
                  {course.subtitle}
                </p>
              </div>

              <img
                src={course.image}
                alt={course.title}
                className="object-contain"
                style={{
                  width: '90px',
                  height: '90px',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
