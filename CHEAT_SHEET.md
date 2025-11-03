# ⚡ ШПАРГАЛКА - Быстрые команды

## 🚀 ЗАПУСК

```bash
# Backend (Mock API)
cd backend && node mock-server.js

# Frontend
cd frontend && npm run dev

# Открыть приложение
http://localhost:5173
```

## 👤 СТАТЬ АДМИНОМ

```sql
-- PostgreSQL
UPDATE users SET role = 'ADMIN' WHERE "telegramId" = 'YOUR_ID';
```

## 📝 СОЗДАТЬ КУРС (API)

```bash
curl -X POST http://localhost:3001/api/admin/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Название курса",
    "shortDescription": "Краткое описание",
    "description": "Полное описание",
    "coverImage": "https://...",
    "price": 2990,
    "category": "Сексуальное образование",
    "level": "BEGINNER",
    "isPublished": true
  }'
```

## 🎥 ДОБАВИТЬ УРОК (API)

```bash
curl -X POST http://localhost:3001/api/admin/courses/COURSE_ID/lessons \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Урок 1",
    "description": "Описание",
    "videoUrl": "https://youtube.com/...",
    "duration": 25,
    "order": 1,
    "isFree": true
  }'
```

## 🎟️ СОЗДАТЬ ПРОМОКОД (API)

```bash
curl -X POST http://localhost:3001/api/admin/promo-codes \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SALE20",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "validFrom": "2024-01-01",
    "validUntil": "2024-12-31",
    "applicableToAllCourses": true
  }'
```

## 📊 ПОЛЕЗНЫЕ API ENDPOINTS

```bash
# Все курсы
GET /api/courses

# Детали курса
GET /api/courses/:id

# Мои курсы
GET /api/courses/my-courses

# Статистика админа
GET /api/admin/dashboard

# Список пользователей
GET /api/admin/users
```

## 🔑 КЛЮЧЕВЫЕ URL

```
Главная:        http://localhost:5173/
Каталог:        http://localhost:5173/courses
Админ:          http://localhost:5173/admin
Создать курс:   http://localhost:5173/admin/courses/new
Пользователи:   http://localhost:5173/admin/users
Промокоды:      http://localhost:5173/admin/promo-codes
```

## 🎨 ЦВЕТА

```css
--primary-pink:   #F173A5
--primary-orange: #FB3B00  
--primary-yellow: #D6DB00
--white:          #FFFFFF
--text-dark:      #333333
```

## 📁 СТРУКТУРА ПРОЕКТА

```
telegram-2/
├── frontend/              # React + TypeScript
│   ├── src/pages/         # Страницы
│   ├── src/components/    # Компоненты
│   ├── src/pages/admin/   # Админ-панель
│   └── src/types/         # TypeScript типы
├── backend/               # Express + TypeScript
│   ├── src/routes/        # API routes
│   ├── src/middleware/    # Middleware
│   ├── src/utils/         # Утилиты
│   └── mock-server.js     # Mock API
└── docs/                  # Документация
```

## 🐛 ОТЛАДКА

```bash
# Проверить процессы
ps aux | grep -E "node|vite"

# Логи backend (если запущен не mock)
tail -f backend/logs/app.log

# Проверить порты
lsof -i :3001  # Backend
lsof -i :5173  # Frontend

# Перезапустить
killall node
npm run dev
```

## 📚 ДОКУМЕНТАЦИЯ

- **ADMIN_GUIDE.md** - Полное руководство администратора
- **QUICK_START.md** - Быстрый старт
- **backend/API_ENDPOINTS.md** - Описание API
- **backend/IMPLEMENTATION_GUIDE.md** - Для разработчиков

## ⚠️ ВАЖНО

- Mock API не сохраняет данные (перезапуск = сброс)
- Для production используй полный backend с PostgreSQL
- Всегда делай бэкап базы перед изменениями
- Промокоды case-sensitive (SALE20 ≠ sale20)

## 🆘 ПОМОЩЬ

**Не работает?**
1. Проверь порты (3001, 5173)
2. Перезапусти серверы
3. Очисти кэш браузера (Ctrl+Shift+Del)
4. Проверь консоль браузера (F12)
5. Посмотри ADMIN_GUIDE.md
