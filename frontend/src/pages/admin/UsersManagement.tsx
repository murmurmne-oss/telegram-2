import { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import UserTable from '@/components/admin/UserTable';
import { api } from '@/services/api';
import { User } from '@/types';
import toast from 'react-hot-toast';

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Ошибка загрузки пользователей');
      // Заглушка для разработки
      const mockUsers: User[] = [
        {
          id: '1',
          telegramId: 123456789,
          username: 'john_doe',
          firstName: 'Иван',
          lastName: 'Иванов',
          photoUrl: 'https://picsum.photos/seed/user1/100/100',
          email: 'ivan@example.com',
          role: 'admin',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          telegramId: 987654321,
          username: 'jane_smith',
          firstName: 'Мария',
          lastName: 'Петрова',
          photoUrl: 'https://picsum.photos/seed/user2/100/100',
          email: 'maria@example.com',
          role: 'user',
          createdAt: '2024-01-20T10:00:00Z'
        },
        {
          id: '3',
          telegramId: 456789123,
          firstName: 'Алексей',
          lastName: 'Сидоров',
          email: 'alex@example.com',
          role: 'user',
          createdAt: '2024-02-01T10:00:00Z'
        }
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Роль пользователя изменена');
      loadUsers();
    } catch (error) {
      toast.error('Ошибка изменения роли');
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/block`);
      toast.success('Пользователь заблокирован');
      loadUsers();
    } catch (error) {
      toast.error('Ошибка блокировки пользователя');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/unblock`);
      toast.success('Пользователь разблокирован');
      loadUsers();
    } catch (error) {
      toast.error('Ошибка разблокировки пользователя');
    }
  };

  const handleExportUsers = () => {
    // Экспорт пользователей в CSV
    const csv = [
      ['ID', 'Имя', 'Email', 'Роль', 'Дата регистрации'].join(','),
      ...users.map(user => [
        user.id,
        `${user.firstName} ${user.lastName || ''}`.trim(),
        user.email || '',
        user.role,
        new Date(user.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Данные экспортированы');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F173A5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-600 mt-2">Управление пользователями платформы</p>
        </div>
        <button
          onClick={handleExportUsers}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <FiDownload className="w-5 h-5" />
          Экспорт
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по имени, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400 w-5 h-5" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
            >
              <option value="all">Все пользователи</option>
              <option value="admin">Администраторы</option>
              <option value="user">Пользователи</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Всего пользователей</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Администраторы</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Обычные пользователи</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {users.filter(u => u.role === 'user').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredUsers.length > 0 ? (
          <UserTable
            users={filteredUsers}
            onChangeRole={handleChangeRole}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
          />
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">Пользователи не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
