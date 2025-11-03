import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Certificate, Purchase } from '@/types';
import { useTelegram } from '@/hooks/useTelegram';
import api from '@/services/api';

interface UserStats {
  totalCourses: number;
  completedCourses: number;
  certificates: number;
  totalSpent: number;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: tgUser, webApp } = useTelegram();

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userRes, statsRes, certificatesRes, purchasesRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/user/stats'),
        api.get('/user/certificates'),
        api.get('/user/purchases'),
      ]);

      setUser(userRes.data);
      setStats(statsRes.data);
      setCertificates(certificatesRes.data);
      setPurchases(purchasesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile data');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Use Telegram user data as fallback
  const displayUser = user || {
    firstName: tgUser?.first_name || 'User',
    lastName: tgUser?.last_name || '',
    username: tgUser?.username,
    photoUrl: tgUser?.photo_url,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-48"></div>
          <div className="p-4 space-y-4">
            <div className="bg-gray-200 h-8 rounded"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[#F173A5] to-[#FB3B00] p-6 pb-12">
        <div className="flex items-center gap-4 mb-6">
          {displayUser.photoUrl ? (
            <img
              src={displayUser.photoUrl}
              alt={displayUser.firstName}
              className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
              <span className="text-3xl font-bold text-white">
                {displayUser.firstName.charAt(0)}
              </span>
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              {displayUser.firstName} {displayUser.lastName}
            </h1>
            {displayUser.username && (
              <p className="text-white/90 text-sm">@{displayUser.username}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="px-4 -mt-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#F173A5] mb-1">{stats.totalCourses}</div>
                <div className="text-sm text-gray-600">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FB3B00] mb-1">{stats.completedCourses}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#D6DB00] mb-1">{stats.certificates}</div>
                <div className="text-sm text-gray-600">Certificates</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800 mb-1">{formatPrice(stats.totalSpent)}</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificates Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">My Certificates</h2>
          {certificates.length > 0 && (
            <button
              onClick={() => navigate('/certificates')}
              className="text-[#F173A5] text-sm font-medium"
            >
              View All
            </button>
          )}
        </div>

        {certificates.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">No certificates yet</p>
            <p className="text-gray-500 text-xs mt-1">Complete a course to earn your first certificate</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.slice(0, 3).map((cert) => (
              <div
                key={cert.id}
                onClick={() => navigate(`/certificates/${cert.id}`)}
                className="bg-gradient-to-r from-[#F173A5] to-[#FB3B00] rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{cert.courseName}</h3>
                    <p className="text-white/80 text-xs">Issued on {formatDate(cert.issuedAt)}</p>
                  </div>
                  <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchase History */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Purchase History</h2>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">No purchases yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.slice(0, 5).map((purchase) => (
              <div
                key={purchase.id}
                className="bg-gray-50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm flex-1 line-clamp-1">
                    {purchase.course.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      purchase.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : purchase.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : purchase.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {purchase.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{formatDate(purchase.purchasedAt)}</span>
                  <span className="font-semibold text-gray-800">{formatPrice(purchase.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings / Actions */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Settings</h2>
        <div className="space-y-2">
          <button
            onClick={() => navigate('/settings/notifications')}
            className="w-full bg-gray-50 rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F173A5]/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#F173A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Notifications</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => navigate('/settings/language')}
            className="w-full bg-gray-50 rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FB3B00]/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#FB3B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Language</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">English</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('token');
                webApp?.close();
              }
            }}
            className="w-full bg-red-50 rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="font-medium text-red-600">Log Out</span>
            </div>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="px-4 mt-8 mb-4 text-center text-gray-400 text-xs">
        <p>MUR MUR Sexual Wellness</p>
        <p className="mt-1">Version 1.0.0</p>
      </div>
    </div>
  );
}
