import { NavLink } from 'react-router-dom';
import { FiHome, FiBook, FiUser, FiShield } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';

export default function Navigation() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const links = [
    { to: '/', icon: FiHome, label: 'Главная' },
    { to: '/courses', icon: FiBook, label: 'Курсы' },
    { to: '/my-courses', icon: FiBook, label: 'Мои курсы' },
    { to: '/profile', icon: FiUser, label: 'Профиль' },
  ];

  if (isAdmin) {
    links.push({ to: '/admin', icon: FiShield, label: 'Админ' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-telegram-secondaryBg border-t border-gray-200 safe-bottom">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-telegram-link'
                  : 'text-telegram-hint'
              }`
            }
          >
            <link.icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
