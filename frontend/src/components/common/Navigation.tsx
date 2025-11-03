import { NavLink } from 'react-router-dom';

export default function Navigation() {
  const links = [
    {
      to: '/',
      icon: 'https://i.postimg.cc/qv2vY1BX/IMG-7114.png',
      label: 'Home',
    },
    {
      to: '/courses',
      icon: 'https://i.postimg.cc/6QjV26ss/open-book.png',
      label: 'Courses',
    },
    {
      to: '/my-courses',
      icon: 'https://i.postimg.cc/kXKy1dSb/book.png',
      label: 'My courses',
    },
    {
      to: '/profile',
      icon: 'https://i.postimg.cc/YqhT84nX/user.png',
      label: 'My account',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex justify-around items-center">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition-all duration-200 ${
                isActive ? 'bg-[#F14D19]' : 'bg-white'
              }`
            }
            style={{ width: '97.5px', height: '67px' }}
          >
            {({ isActive }) => (
              <>
                <img
                  src={link.icon}
                  alt={link.label}
                  className="w-11 h-11 object-contain mb-1"
                  style={{ width: '44px', height: '44px' }}
                />
                <span
                  className="text-[10px]"
                  style={{
                    fontFamily: 'Montserrat',
                    fontWeight: 400,
                    color: isActive ? '#FFFFFF' : '#000000',
                  }}
                >
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
