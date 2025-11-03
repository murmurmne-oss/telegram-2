import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiBook,
  FiUsers,
  FiTag,
  FiBarChart2,
  FiSettings,
  FiLogOut
} from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { path: '/admin', icon: FiHome, label: 'Главная', exact: true },
  { path: '/admin/courses', icon: FiBook, label: 'Курсы' },
  { path: '/admin/users', icon: FiUsers, label: 'Пользователи' },
  { path: '/admin/promo-codes', icon: FiTag, label: 'Промокоды' },
  { path: '/admin/analytics', icon: FiBarChart2, label: 'Аналитика' },
  { path: '/admin/settings', icon: FiSettings, label: 'Настройки' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          w-64 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#F173A5] to-[#FB3B00] bg-clip-text text-transparent">
            Админ-панель
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {user?.firstName || 'Администратор'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-[#F173A5] to-[#FB3B00] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg
              text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Выйти</span>
          </button>
        </div>
      </aside>
    </>
  );
}
