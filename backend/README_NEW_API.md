# 🚀 Backend API для Telegram Mini App - Курсы

Полноценный backend API с аутентификацией через Telegram WebApp, admin панелью, системой покупок и генерацией сертификатов.

## ✅ Что реализовано

### 📚 5 основных API модулей:

1. **Courses API** (`/api/courses`) - 726 строк
   - Список курсов с фильтрами, поиском, сортировкой
   - Мои купленные курсы с прогрессом
   - Детали курса с уроками
   - Покупка курса с промокодами
   - Система отзывов и рейтингов

2. **Lessons API** (`/api/lessons`) - 341 строка
   - Получение урока с материалами
   - Отслеживание прогресса (время просмотра, заметки)
   - Навигация между уроками
   - Автоматический пересчет прогресса курса

3. **Admin API** (`/api/admin`) - 785 строк
   - Dashboard с детальной статистикой
   - CRUD для курсов и уроков
   - Управление промокодами
   - Управление пользователями и ролями
   - Блокировка пользователей

4. **Certificates API** (`/api/certificates`) - 238 строк
   - Автоматическая генерация сертификатов
   - Публичная проверка подлинности
   - История всех сертификатов

5. **Purchases API** (`/api/purchases`) - 537 строк
   - История покупок
   - Интеграция с Telegram Payments
   - Webhook для обработки платежей
   - Валидация промокодов
   - Возврат средств

### 🔐 Безопасность и утилиты:

- **Telegram Auth Utils** - Валидация Telegram WebApp initData
- **Admin Middleware** - Проверка прав доступа
- **Error Handling** - Централизованная обработка ошибок

## 📁 Созданные файлы

```
backend/
├── src/
│   ├── routes/
│   │   ├── courses.ts          ✨ НОВЫЙ (726 строк)
│   │   ├── lessons.ts          ✨ НОВЫЙ (341 строка)
│   │   ├── admin.ts            ✨ НОВЫЙ (785 строк)
│   │   ├── certificates.ts     ✨ НОВЫЙ (238 строк)
│   │   └── purchases.ts        ✨ НОВЫЙ (537 строк)
│   ├── middleware/
│   │   ├── auth.ts             ✅ Обновлен
│   │   └── admin.ts            ✨ НОВЫЙ
│   ├── utils/
│   │   └── telegram-auth.ts    ✨ НОВЫЙ
│   └── index.ts                ✅ Обновлен (подключены routes)
├── API_ENDPOINTS.md            📚 Документация API
├── IMPLEMENTATION_GUIDE.md     📚 Руководство
└── CREATED_FILES.md            📚 Список файлов
```

## 🎯 Быстрый старт

### 1. Установка зависимостей

```bash
cd /home/user/telegram-2/backend
npm install
```

### 2. Настройка окружения

Убедитесь что в `.env` файле установлены:

```env
DATABASE_URL="postgresql://..."
TELEGRAM_BOT_TOKEN="your_bot_token"
JWT_SECRET="your_secret"
PORT=3000
```

### 3. Миграция БД

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 4. Запуск сервера

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📖 Использование

### Frontend (Telegram Mini App)

```typescript
// Инициализация Telegram WebApp
import { initData } from '@telegram-apps/sdk';

// Запрос к API
const response = await fetch('https://api.example.com/api/courses', {
  headers: {
    'X-Telegram-Init-Data': initData,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Примеры endpoints:

```bash
# Получить все курсы
GET /api/courses?category=design&level=BEGINNER&page=1

# Купить курс
POST /api/courses/:id/purchase
Body: { "promoCode": "SALE2024" }

# Обновить прогресс урока
POST /api/lessons/:id/progress
Body: { "watchTime": 300, "isCompleted": true }

# Admin: Создать курс
POST /api/admin/courses
Body: { "title": "...", "price": 999, ... }

# Получить сертификат
GET /api/certificates/:courseId
```

## 🔑 Аутентификация

### Telegram WebApp

Все защищенные endpoints требуют заголовок:

```
X-Telegram-Init-Data: query_id=...&user=...&auth_date=...&hash=...
```

Аутентификация происходит автоматически через `authenticateTelegram` middleware.

### Роли пользователей

- **USER** - Обычный пользователь
- **ADMIN** - Администратор (управление контентом)
- **SUPER_ADMIN** - Супер-админ (управление пользователями)

## 📊 API Endpoints

### Courses

- `GET /api/courses` - Список курсов
- `GET /api/courses/my-courses` - Мои курсы
- `GET /api/courses/:id` - Детали курса
- `GET /api/courses/:id/lessons` - Уроки курса
- `GET /api/courses/:id/progress` - Прогресс
- `POST /api/courses/:id/purchase` - Купить
- `POST /api/courses/:id/reviews` - Отзыв
- `GET /api/courses/:id/reviews` - Отзывы

### Lessons

- `GET /api/lessons/:id` - Получить урок
- `POST /api/lessons/:id/progress` - Обновить прогресс
- `GET /api/lessons/:id/next` - Следующий урок

### Admin

- `GET /api/admin/check-access` - Проверка прав
- `GET /api/admin/dashboard` - Статистика
- `POST /api/admin/courses` - Создать курс
- `PUT /api/admin/courses/:id` - Обновить курс
- `DELETE /api/admin/courses/:id` - Удалить курс
- `POST /api/admin/courses/:courseId/lessons` - Добавить урок
- `POST /api/admin/promo-codes` - Создать промокод
- `GET /api/admin/users` - Пользователи
- `PUT /api/admin/users/:id/role` - Изменить роль

### Certificates

- `GET /api/certificates` - Мои сертификаты
- `GET /api/certificates/:courseId` - Получить сертификат
- `GET /api/certificates/verify/:number` - Проверить

### Purchases

- `GET /api/purchases` - История покупок
- `POST /api/purchases/create-invoice` - Создать invoice
- `POST /api/purchases/webhook` - Webhook от Telegram
- `POST /api/purchases/validate-promo` - Проверить промокод

**Полная документация:** [API_ENDPOINTS.md](./API_ENDPOINTS.md)

## 🛠 Особенности

### ✅ Реализовано

- [x] Аутентификация через Telegram WebApp
- [x] Валидация hash от Telegram
- [x] Автоматическое создание пользователей
- [x] Проверка прав доступа
- [x] Фильтрация, поиск, сортировка
- [x] Пагинация для всех списков
- [x] Система промокодов
- [x] Отслеживание прогресса
- [x] Генерация сертификатов
- [x] Admin панель со статистикой
- [x] Управление пользователями
- [x] Интеграция с Telegram Payments
- [x] Webhook для платежей
- [x] Возврат средств
- [x] Транзакции для критичных операций
- [x] Централизованная обработка ошибок

### 🔜 TODO (для полной интеграции)

- [ ] Telegram Bot для отправки уведомлений
- [ ] Генерация PDF сертификатов
- [ ] Загрузка файлов (обложки, видео)
- [ ] Email уведомления
- [ ] Redis для кэширования
- [ ] Rate limiting
- [ ] Детальная аналитика

## 📚 Документация

1. **[API_ENDPOINTS.md](./API_ENDPOINTS.md)**
   - Полная документация всех endpoints
   - Примеры запросов и ответов
   - Параметры и коды ошибок

2. **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)**
   - Руководство по реализации
   - Best practices
   - Советы по безопасности
   - Примеры кода

3. **[CREATED_FILES.md](./CREATED_FILES.md)**
   - Список всех созданных файлов
   - Статистика
   - Детальное описание

## 🧪 Тестирование

### Генерация тестового initData

```typescript
import { generateTestInitData } from './src/utils/telegram-auth';

const testInitData = generateTestInitData(
  {
    id: 123456789,
    first_name: 'Test',
    username: 'testuser'
  },
  process.env.TELEGRAM_BOT_TOKEN!
);

// Использовать в X-Telegram-Init-Data header
```

### Пример с curl

```bash
# Получить курсы
curl -H "X-Telegram-Init-Data: $INIT_DATA" \
  http://localhost:3000/api/courses

# Создать курс (admin)
curl -X POST \
  -H "X-Telegram-Init-Data: $INIT_DATA" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Course","description":"Test","price":999,"categoryId":"...","slug":"test-course"}' \
  http://localhost:3000/api/admin/courses
```

## 🔒 Безопасность

- ✅ Валидация Telegram WebApp hash
- ✅ Проверка актуальности auth_date
- ✅ Проверка прав доступа на каждом endpoint
- ✅ Валидация всех входных данных
- ✅ Prepared statements (Prisma)
- ✅ Транзакции для критичных операций
- ✅ CORS настройка
- ✅ Helmet для HTTP headers
- ✅ Логирование действий админа

## 📈 Производительность

- ✅ Parallel queries с Promise.all()
- ✅ Select только нужных полей
- ✅ Индексы в Prisma schema
- ✅ Пагинация для больших списков
- ✅ Кэширование (готово к добавлению Redis)

## 🎉 Готово к использованию!

Все endpoints полностью функциональны и готовы к интеграции с frontend Telegram Mini App.

**Общий объем:**
- 2,627+ строк TypeScript кода
- ~64 KB кода + ~27 KB документации
- 5 основных API модулей
- Полная система аутентификации и авторизации

---

**Автор:** Claude Code Agent
**Дата:** 2025-11-03
**Версия:** 1.0.0
