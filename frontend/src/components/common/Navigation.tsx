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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="grid grid-cols-4 h-[80px] max-w-md mx-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                isActive ? 'text-[#F14D19]' : 'text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
                  isActive ? 'bg-[#F14D19]/10' : ''
                }`}>
                  <img
                    src={link.icon}
                    alt={link.label}
                    className="w-7 h-7 object-contain"
                    style={{ filter: isActive ? 'brightness(0) saturate(100%) invert(34%) sepia(95%) saturate(4614%) hue-rotate(358deg) brightness(97%) contrast(96%)' : 'none' }}
                  />
                </div>
                <span
                  className="text-[10px] font-medium"
                >
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      {/* Safe area for iOS devices */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white"></div>
    </nav>
  );
}
