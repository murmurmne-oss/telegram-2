import { useState } from 'react';
import { FiMoreVertical, FiShield, FiLock, FiUnlock } from 'react-icons/fi';
import { User } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface UserTableProps {
  users: User[];
  onChangeRole: (userId: string, role: string) => void;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
}

export default function UserTable({
  users,
  onChangeRole,
  onBlockUser,
  onUnblockUser
}: UserTableProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (userId: string) => {
    setActiveMenu(activeMenu === userId ? null : userId);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Админ' },
      user: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Пользователь' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Пользователь
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Роль
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дата регистрации
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {user.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt={user.firstName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F173A5] to-[#FB3B00] flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.firstName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{user.username || 'no_username'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.email || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getRoleBadge(user.role)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: ru })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative inline-block">
                  <button
                    onClick={() => toggleMenu(user.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiMoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {activeMenu === user.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => {
                          onChangeRole(user.id, user.role === 'admin' ? 'user' : 'admin');
                          setActiveMenu(null);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiShield className="w-4 h-4" />
                        {user.role === 'admin' ? 'Убрать админа' : 'Сделать админом'}
                      </button>
                      <button
                        onClick={() => {
                          onBlockUser(user.id);
                          setActiveMenu(null);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FiLock className="w-4 h-4" />
                        Заблокировать
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
