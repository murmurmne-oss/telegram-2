import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import Sidebar from '@/components/admin/Sidebar';
import AdminDashboard from './admin/AdminDashboard';
import CoursesList from './admin/CoursesList';
import CourseEditor from './admin/CourseEditor';
import UsersManagement from './admin/UsersManagement';
import PromoCodesPage from './admin/PromoCodesPage';

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        >
          <FiMenu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<CoursesList />} />
              <Route path="courses/create" element={<CourseEditor />} />
              <Route path="courses/edit/:id" element={<CourseEditor />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="promo-codes" element={<PromoCodesPage />} />

              {/* Placeholder routes */}
              <Route path="analytics" element={<PlaceholderPage title="Аналитика" />} />
              <Route path="settings" element={<PlaceholderPage title="Настройки" />} />

              {/* Redirect to dashboard */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

// Placeholder component for unimplemented pages
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600">Эта страница находится в разработке</p>
      </div>
    </div>
  );
}
