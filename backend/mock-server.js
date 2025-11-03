const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock данные
const mockCourses = [
  {
    id: '1',
    title: 'Основной курс - Азбука Секса',
    description: 'Комплексный курс о сексуальном образовании',
    coverImage: 'https://i.postimg.cc/hvSQcWwL/Neutral-Black-And-White-Minimalist-Aesthetic-Modern-Simple-Laser-Hair-Removal-Instagram-Post-1.png',
    price: 2990,
    discountPrice: 1990,
    category: 'Сексуальное образование',
    level: 'BEGINNER',
    duration: 360,
    rating: 4.8,
    reviewCount: 127,
    isPublished: true,
    studentCount: 543
  },
  {
    id: '2',
    title: 'Психология отношений',
    description: 'Узнайте секреты здоровых отношений',
    coverImage: 'https://i.postimg.cc/gj37dLxM/Dizajn-bez-nazvania-2.png',
    price: 1990,
    category: 'Отношения',
    level: 'INTERMEDIATE',
    duration: 240,
    rating: 4.6,
    reviewCount: 89,
    isPublished: true,
    studentCount: 312
  },
  {
    id: '3',
    title: 'Здоровье и wellness',
    description: 'Позаботьтесь о своем здоровье',
    coverImage: 'https://i.postimg.cc/QCqq0Q9D/Dizajn-bez-nazvania-6-removebg-preview.png',
    price: 1490,
    category: 'Здоровье',
    level: 'BEGINNER',
    duration: 180,
    rating: 4.9,
    reviewCount: 203,
    isPublished: true,
    studentCount: 678
  }
];

// API Routes
app.get('/api/courses', (req, res) => {
  res.json(mockCourses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = mockCourses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  
  res.json({
    ...course,
    lessons: [
      { id: '1', title: 'Введение', duration: 15, isFree: true, order: 1 },
      { id: '2', title: 'Основы', duration: 30, isFree: false, order: 2 },
      { id: '3', title: 'Практика', duration: 45, isFree: false, order: 3 }
    ]
  });
});

app.get('/api/courses/my-courses', (req, res) => {
  res.json([
    { ...mockCourses[0], progress: 45 },
    { ...mockCourses[1], progress: 100 }
  ]);
});

app.get('/api/admin/check-access', (req, res) => {
  res.json({ hasAccess: true, role: 'ADMIN' });
});

app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    stats: {
      totalStudents: 1523,
      totalCourses: 12,
      totalRevenue: 4567890,
      totalSales: 892
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET  /api/courses`);
  console.log(`   GET  /api/courses/:id`);
  console.log(`   GET  /api/courses/my-courses`);
  console.log(`   GET  /api/admin/check-access`);
  console.log(`   GET  /api/admin/dashboard`);
});
