# Backend API Implementation Guide

Руководство по реализации полноценных backend API endpoints для Telegram Mini App курсов.

## 🎯 Что было создано

### 1. Routes (API Endpoints)

#### `/backend/src/routes/courses.ts` (726 строк)
Полноценный API для работы с курсами:
- ✅ GET `/api/courses` - Список курсов с фильтрами, поиском, сортировкой и пагинацией
- ✅ GET `/api/courses/my-courses` - Купленные курсы пользователя с прогрессом
- ✅ GET `/api/courses/:id` - Детали курса
- ✅ GET `/api/courses/:id/lessons` - Список уроков курса
- ✅ GET `/api/courses/:id/progress` - Прогресс по курсу
- ✅ POST `/api/courses/:id/purchase` - Покупка курса с промокодом
- ✅ POST `/api/courses/:id/reviews` - Создание отзыва
- ✅ GET `/api/courses/:id/reviews` - Получение отзывов

**Особенности:**
- Проверка покупки курса для доступа
- Автоматический расчет рейтинга курса
- Применение промокодов со всеми проверками
- Отслеживание просмотров курса

#### `/backend/src/routes/lessons.ts` (341 строка)
API для работы с уроками:
- ✅ GET `/api/lessons/:id` - Получить урок с материалами
- ✅ POST `/api/lessons/:id/progress` - Обновить прогресс (watchTime, isCompleted, notes)
- ✅ GET `/api/lessons/:id/next` - Получить следующий урок

**Особенности:**
- Автоматический пересчет прогресса курса
- Проверка доступа к платным урокам
- Поддержка заметок пользователя

#### `/backend/src/routes/admin.ts` (785 строк)
Полноценная админ-панель:
- ✅ GET `/api/admin/check-access` - Проверка прав
- ✅ GET `/api/admin/dashboard` - Статистика с графиками
- ✅ POST `/api/admin/courses` - Создание курса
- ✅ PUT `/api/admin/courses/:id` - Редактирование курса
- ✅ DELETE `/api/admin/courses/:id` - Удаление курса
- ✅ POST `/api/admin/courses/:courseId/lessons` - Добавление урока
- ✅ PUT `/api/admin/lessons/:id` - Редактирование урока
- ✅ DELETE `/api/admin/lessons/:id` - Удаление урока
- ✅ POST `/api/admin/promo-codes` - Создание промокода
- ✅ GET `/api/admin/users` - Список пользователей
- ✅ PUT `/api/admin/users/:id/role` - Изменение роли (SUPER_ADMIN only)
- ✅ PUT `/api/admin/users/:id/block` - Блокировка пользователя

**Особенности:**
- Raw SQL для статистики по дням
- Защита от удаления курсов с покупками
- Проверка уникальности slug
- Различные уровни доступа (ADMIN, SUPER_ADMIN)

#### `/backend/src/routes/certificates.ts` (238 строк)
API для сертификатов:
- ✅ GET `/api/certificates` - Все сертификаты пользователя
- ✅ GET `/api/certificates/:courseId` - Получить/сгенерировать сертификат
- ✅ GET `/api/certificates/verify/:certificateNumber` - Проверка подлинности (публичный)

**Особенности:**
- Автоматическая генерация при завершении курса
- Уникальный номер сертификата
- Публичная проверка подлинности

#### `/backend/src/routes/purchases.ts` (537 строк)
API для покупок и платежей:
- ✅ GET `/api/purchases` - История покупок
- ✅ GET `/api/purchases/:id` - Детали покупки
- ✅ POST `/api/purchases/create-invoice` - Создание invoice для Telegram Payments
- ✅ POST `/api/purchases/webhook` - Обработка webhook от Telegram
- ✅ POST `/api/purchases/:id/refund` - Возврат средств (admin only)
- ✅ POST `/api/purchases/validate-promo` - Проверка промокода

**Особенности:**
- Поддержка Telegram Stars
- Webhook для автоматической обработки платежей
- Транзакции для атомарности операций
- Обновление счетчиков курса и промокодов

### 2. Middleware

#### `/backend/src/middleware/auth.ts` (уже существовал)
- ✅ `authenticateTelegram` - Валидация Telegram WebApp initData
- ✅ `authenticateJWT` - JWT аутентификация (опционально)
- ✅ `requireAdmin` - Проверка прав админа
- ✅ `requireSuperAdmin` - Проверка прав супер-админа

#### `/backend/src/middleware/admin.ts` (создан)
Дополнительные middleware для админ-панели:
- ✅ `requireAdmin` - Проверка прав администратора
- ✅ `requireSuperAdmin` - Проверка прав супер-администратора
- ✅ `logAdminAction` - Логирование действий админа

### 3. Utils

#### `/backend/src/utils/telegram-auth.ts` (создан)
Утилиты для работы с Telegram WebApp:
- ✅ `validateTelegramWebAppData()` - Валидация hash
- ✅ `parseTelegramWebAppData()` - Парсинг initData
- ✅ `extractUserFromInitData()` - Извлечение данных пользователя
- ✅ `isAuthDateValid()` - Проверка актуальности данных
- ✅ `validateAndExtractTelegramData()` - Полная валидация
- ✅ `generateTestInitData()` - Генерация тестовых данных (для разработки)

## 🔧 Интеграция

### Подключение routes в `/backend/src/index.ts`

```typescript
// New comprehensive API routes
import coursesRoutes from './routes/courses';
import lessonsRoutes from './routes/lessons';
import adminApiRoutes from './routes/admin';
import certificatesRoutes from './routes/certificates';
import purchasesRoutes from './routes/purchases';

// ...

app.use('/api/courses', coursesRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/admin', adminApiRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/purchases', purchasesRoutes);
```

## 📊 Используемые технологии

- **Express.js** - Web framework
- **Prisma ORM** - Database ORM
- **TypeScript** - Type safety
- **Crypto** - Hash валидация для Telegram
- **PostgreSQL** - Database (через Prisma)

## 🔐 Безопасность

### 1. Аутентификация
```typescript
// В каждом защищенном endpoint
router.get('/path', authenticateTelegram, asyncHandler(async (req, res) => {
  // req.user доступен после аутентификации
  const userId = req.user!.id;
}));
```

### 2. Авторизация
```typescript
// Для админских endpoints
router.post('/admin/path', authenticateTelegram, requireAdmin, asyncHandler(...));

// Для супер-админских endpoints
router.put('/admin/users/:id/role', authenticateTelegram, requireSuperAdmin, asyncHandler(...));
```

### 3. Валидация данных
```typescript
// Проверка обязательных полей
if (!title || !description) {
  throw new AppError('Missing required fields', 400);
}

// Проверка прав доступа
const purchase = await prisma.purchase.findFirst({
  where: { userId: req.user!.id, courseId, status: 'COMPLETED' }
});

if (!purchase) {
  throw new AppError('Purchase course to access this lesson', 403);
}
```

## 📝 Обработка ошибок

Все endpoints используют `asyncHandler` для автоматической обработки ошибок:

```typescript
import { AppError, asyncHandler } from '../middleware/errorHandler';

router.get('/path', asyncHandler(async (req, res) => {
  // Ошибки автоматически обрабатываются
  if (error) {
    throw new AppError('Error message', 404);
  }
}));
```

## 🎨 Форматирование данных

### Decimal в String
```typescript
// Prisma возвращает Decimal, конвертируем в string для JSON
{
  price: course.price.toString(),
  discountPrice: course.discountPrice?.toString(),
  rating: course.rating?.toString(),
}
```

### BigInt в String
```typescript
// BigInt (telegramId) в string
{
  telegramId: user.telegramId.toString()
}
```

## 🔄 Транзакции

Для критичных операций используются транзакции:

```typescript
await prisma.$transaction(async (tx) => {
  // Обновление статуса покупки
  await tx.purchase.update({...});

  // Обновление счетчика курса
  await tx.course.update({...});

  // Создание прогресса
  await tx.courseProgress.create({...});
});
```

## 📦 Пагинация

Стандартный подход к пагинации:

```typescript
const pageNum = parseInt(page as string);
const limitNum = parseInt(limit as string);
const skip = (pageNum - 1) * limitNum;

const [items, total] = await Promise.all([
  prisma.model.findMany({ skip, take: limitNum }),
  prisma.model.count({ where })
]);

res.json({
  success: true,
  data: {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    }
  }
});
```

## 🎯 Промокоды

### Валидация промокода:

1. Проверка существования
2. Проверка активности
3. Проверка периода действия
4. Проверка лимита использований
5. Проверка применимости к курсу
6. Проверка минимальной суммы покупки

### Применение скидки:

```typescript
if (promo.type === 'PERCENTAGE') {
  discountAmount = (Number(finalPrice) * promo.value) / 100;
} else {
  discountAmount = promo.value;
}
finalPrice = Number(finalPrice) - discountAmount;
```

## 📈 Прогресс курса

Автоматический пересчет при обновлении прогресса урока:

```typescript
const totalLessons = lesson.course.lessons.length;
const completedLessons = allLessonsProgress.filter(lp => lp.isCompleted).length;
const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

await prisma.courseProgress.update({
  where: { id: courseProgress.id },
  data: {
    progress: progressPercentage,
    isCompleted: progressPercentage === 100,
    completedAt: progressPercentage === 100 ? new Date() : null,
  }
});
```

## 🧪 Тестирование

### Генерация тестового initData:

```typescript
import { generateTestInitData } from './utils/telegram-auth';

const testInitData = generateTestInitData(
  {
    id: 123456789,
    first_name: 'Test',
    username: 'testuser'
  },
  process.env.TELEGRAM_BOT_TOKEN!
);

// Использовать в заголовке X-Telegram-Init-Data
```

## 🚀 Следующие шаги

### TODO для полной интеграции:

1. **Telegram Bot Integration**
   - Интеграция с Telegram Bot API для invoice
   - Отправка уведомлений пользователям
   - Welcome сообщения после покупки

2. **Certificate Generation**
   - Интеграция с сервисом генерации PDF сертификатов
   - Загрузка шаблонов сертификатов
   - Водяные знаки и защита

3. **File Uploads**
   - Загрузка обложек курсов
   - Загрузка видео уроков
   - Загрузка материалов

4. **Email Notifications**
   - Уведомления о покупках
   - Уведомления о завершении курса

5. **Analytics**
   - Детальная аналитика по курсам
   - Воронка продаж
   - A/B тестирование

## 📚 Полезные ссылки

- [API Endpoints Documentation](./API_ENDPOINTS.md)
- [Prisma Schema](./prisma/schema.prisma)
- [Telegram WebApp Docs](https://core.telegram.org/bots/webapps)
- [Telegram Payments Docs](https://core.telegram.org/bots/payments)

## ⚡ Производительность

### Оптимизации:

1. **Parallel Queries**
```typescript
const [courses, total] = await Promise.all([
  prisma.course.findMany(...),
  prisma.course.count(...)
]);
```

2. **Select только нужные поля**
```typescript
select: {
  id: true,
  title: true,
  // Только необходимые поля
}
```

3. **Include только при необходимости**
```typescript
include: {
  category: true, // Только если нужно
  _count: { select: { lessons: true } }
}
```

4. **Индексы в Prisma**
```prisma
@@unique([userId, courseId])
@@index([categoryId])
```

## 🛡️ Безопасность Best Practices

1. ✅ Валидация всех входных данных
2. ✅ Проверка прав доступа на каждом endpoint
3. ✅ Использование prepared statements (Prisma)
4. ✅ Rate limiting (можно добавить express-rate-limit)
5. ✅ CORS настройка для Telegram WebApp
6. ✅ Helmet для HTTP headers security
7. ✅ Логирование всех действий админа

## 📊 Структура ответов API

### Успешный ответ:
```json
{
  "success": true,
  "data": {...}
}
```

### Ошибка:
```json
{
  "success": false,
  "error": "Error message"
}
```

### С пагинацией:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```
