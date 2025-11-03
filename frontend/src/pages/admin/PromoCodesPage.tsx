import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiCopy, FiCheck } from 'react-icons/fi';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  maxUses: number;
  currentUses: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'fixed',
    maxUses: 100,
    expiresAt: ''
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/promo-codes');
      setPromoCodes(response.data.data);
    } catch (error) {
      toast.error('Ошибка загрузки промокодов');
      // Заглушка для разработки
      const mockPromoCodes: PromoCode[] = [
        {
          id: '1',
          code: 'WELCOME2024',
          discount: 20,
          discountType: 'percentage',
          maxUses: 100,
          currentUses: 45,
          expiresAt: '2024-12-31T23:59:59Z',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          code: 'NEWYEAR',
          discount: 500,
          discountType: 'fixed',
          maxUses: 50,
          currentUses: 32,
          expiresAt: '2024-02-01T23:59:59Z',
          isActive: true,
          createdAt: '2024-01-01T10:00:00Z'
        },
        {
          id: '3',
          code: 'SUMMER2023',
          discount: 15,
          discountType: 'percentage',
          maxUses: 200,
          currentUses: 200,
          expiresAt: '2023-09-01T23:59:59Z',
          isActive: false,
          createdAt: '2023-06-01T10:00:00Z'
        }
      ];
      setPromoCodes(mockPromoCodes);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/admin/promo-codes', formData);
      toast.success('Промокод создан');
      setShowCreateForm(false);
      setFormData({
        code: '',
        discount: 0,
        discountType: 'percentage',
        maxUses: 100,
        expiresAt: ''
      });
      loadPromoCodes();
    } catch (error) {
      toast.error('Ошибка создания промокода');
    }
  };

  const handleDeletePromoCode = async (promoCodeId: string) => {
    if (!confirm('Удалить промокод?')) return;

    try {
      await api.delete(`/admin/promo-codes/${promoCodeId}`);
      toast.success('Промокод удален');
      loadPromoCodes();
    } catch (error) {
      toast.error('Ошибка удаления промокода');
    }
  };

  const handleToggleActive = async (promoCodeId: string, isActive: boolean) => {
    try {
      await api.patch(`/admin/promo-codes/${promoCodeId}`, { isActive: !isActive });
      toast.success(isActive ? 'Промокод деактивирован' : 'Промокод активирован');
      loadPromoCodes();
    } catch (error) {
      toast.error('Ошибка изменения статуса');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Промокод скопирован');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
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
          <h1 className="text-3xl font-bold text-gray-900">Промокоды</h1>
          <p className="text-gray-600 mt-2">Управление промокодами и скидками</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F173A5] to-[#FB3B00] text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
        >
          <FiPlus className="w-5 h-5" />
          Создать промокод
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Новый промокод</h2>
          <form onSubmit={handleCreatePromoCode} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Код промокода *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
                    placeholder="WELCOME2024"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Генерировать
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип скидки
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
                >
                  <option value="percentage">Процент</option>
                  <option value="fixed">Фиксированная сумма</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Размер скидки *
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
                  placeholder={formData.discountType === 'percentage' ? '20' : '500'}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.discountType === 'percentage' ? 'Процент скидки (1-100)' : 'Сумма скидки в рублях'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Макс. использований
                </label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Срок действия
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F173A5] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-[#F173A5] to-[#FB3B00] text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                Создать
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Всего промокодов</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{promoCodes.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Активные</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {promoCodes.filter(p => p.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Всего использований</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {promoCodes.reduce((sum, p) => sum + p.currentUses, 0)}
          </p>
        </div>
      </div>

      {/* Promo Codes List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Промокод
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Скидка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Использовано
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Срок действия
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promoCodes.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-1 bg-gray-100 rounded font-mono text-sm">
                        {promo.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(promo.code)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {copiedCode === promo.code ? (
                          <FiCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <FiCopy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {promo.discountType === 'percentage'
                      ? `${promo.discount}%`
                      : `${promo.discount} ₽`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {promo.currentUses} / {promo.maxUses}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-[#F173A5] to-[#FB3B00] h-2 rounded-full"
                        style={{ width: `${(promo.currentUses / promo.maxUses) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(promo.expiresAt), 'dd MMM yyyy', { locale: ru })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(promo.id, promo.isActive)}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        promo.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {promo.isActive ? 'Активен' : 'Неактивен'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDeletePromoCode(promo.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
