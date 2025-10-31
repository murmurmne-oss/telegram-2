# Архитектура Telegram Mini App для продажи курсов

## 📋 Содержание
1. [Обзор системы](#обзор-системы)
2. [Технологический стек](#технологический-стек)
3. [Структура проекта](#структура-проекта)
4. [Функциональные возможности](#функциональные-возможности)
5. [База данных](#база-данных)
6. [API Endpoints](#api-endpoints)
7. [Интеграция с Telegram](#интеграция-с-telegram)
8. [Система платежей](#система-платежей)
9. [Безопасность](#безопасность)

---

## 🎯 Обзор системы

Telegram Mini App для продажи онлайн-курсов с полным функционалом администрирования.

### Основные компоненты:
- **Frontend**: React + TypeScript Mini App
- **Backend**: Node.js + Express API
- **Database**: PostgreSQL с Prisma ORM
- **Bot**: Telegram Bot для интеграции
- **Storage**: AWS S3 / MinIO для медиа-контента

---

## 🛠 Технологический стек

### Frontend (Telegram Mini App)
```
- React 18 + TypeScript
- Vite (сборщик)
- @telegram-apps/sdk (Telegram WebApp API)
- TanStack Query (управление состоянием сервера)
- Zustand (локальное состояние)
- React Router (навигация)
- Tailwind CSS (стили)
- Framer Motion (анимации)
```

### Backend
```
- Node.js 20+
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL 15+
- Redis (кэширование)
- JWT (аутентификация)
```

### DevOps
```
- Docker + Docker Compose
- Nginx (прокси)
- PM2 (процесс-менеджер)
- GitHub Actions (CI/CD)
```

---

## 📁 Структура проекта

```
telegram-course-app/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── controllers/       # Контроллеры
│   │   ├── services/          # Бизнес-логика
│   │   ├── models/            # Модели данных
│   │   ├── middleware/        # Middleware
│   │   ├── routes/            # API роуты
│   │   ├── utils/             # Утилиты
│   │   ├── config/            # Конфигурация
│   │   └── types/             # TypeScript типы
│   ├── prisma/
│   │   └── schema.prisma      # Схема БД
│   ├── tests/                 # Тесты
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Telegram Mini App
│   ├── public/
│   ├── src/
│   │   ├── components/        # React компоненты
│   │   │   ├── common/       # Общие компоненты
│   │   │   ├── courses/      # Курсы
│   │   │   ├── admin/        # Админ панель
│   │   │   └── profile/      # Профиль
│   │   ├── pages/            # Страницы
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API сервисы
│   │   ├── store/            # Zustand store
│   │   ├── styles/           # Стили
│   │   ├── utils/            # Утилиты
│   │   ├── types/            # TypeScript типы
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── bot/                       # Telegram Bot
│   ├── src/
│   │   ├── handlers/         # Обработчики команд
│   │   ├── keyboards/        # Клавиатуры
│   │   ├── services/         # Сервисы
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                    # Общий код
│   └── types/                # Общие типы
│
├── docker/                    # Docker конфигурация
│   ├── nginx/
│   ├── postgres/
│   └── redis/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚡ Функциональные возможности

### Для пользователей:

#### 1. **Просмотр курсов**
- Каталог курсов с фильтрами
- Детальная страница курса
- Превью уроков
- Отзывы и рейтинги

#### 2. **Покупка курсов**
- Корзина
- Несколько способов оплаты
- Промокоды и скидки
- История покупок

#### 3. **Обучение**
- Доступ к купленным курсам
- Прогресс прохождения
- Закладки и заметки
- Сертификаты об окончании

#### 4. **Профиль**
- Мои курсы
- История платежей
- Настройки уведомлений
- Достижения

### Для администраторов:

#### 1. **Управление курсами**
- Создание/редактирование курсов
- Управление уроками
- Загрузка видео и материалов
- Публикация/снятие с публикации

#### 2. **Аналитика**
- Статистика продаж
- Популярные курсы
- Конверсия
- Активность пользователей

#### 3. **Управление пользователями**
- Список пользователей
- Выдача доступов
- Блокировка/разблокировка
- Роли и права

#### 4. **Финансы**
- Отчёты о продажах
- Управление промокодами
- Настройка цен
- Возвраты

#### 5. **Контент**
- Медиа-библиотека
- Категории курсов
- Теги
- SEO настройки

---

## 🗄 База данных

### Схема Prisma

```prisma
// Пользователи
model User {
  id            String    @id @default(uuid())
  telegramId    BigInt    @unique
  username      String?
  firstName     String?
  lastName      String?
  photoUrl      String?
  languageCode  String?
  role          Role      @default(USER)
  isBlocked     Boolean   @default(false)

  purchases     Purchase[]
  progress      CourseProgress[]
  reviews       Review[]
  certificates  Certificate[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}

// Курсы
model Course {
  id            String    @id @default(uuid())
  title         String
  description   String
  shortDesc     String?
  coverImage    String?
  price         Decimal   @db.Decimal(10, 2)
  discountPrice Decimal?  @db.Decimal(10, 2)
  currency      String    @default("RUB")

  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])

  isPublished   Boolean   @default(false)
  level         Level     @default(BEGINNER)
  duration      Int       // в минутах

  lessons       Lesson[]
  purchases     Purchase[]
  reviews       Review[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Level {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

// Категории
model Category {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  icon        String?
  order       Int       @default(0)

  courses     Course[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Уроки
model Lesson {
  id          String    @id @default(uuid())
  title       String
  description String?
  content     String?   // текстовый контент
  videoUrl    String?
  duration    Int?      // в секундах
  order       Int
  isFree      Boolean   @default(false)

  courseId    String
  course      Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)

  progress    LessonProgress[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Покупки
model Purchase {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])

  courseId    String
  course      Course    @relation(fields: [courseId], references: [id])

  amount      Decimal   @db.Decimal(10, 2)
  currency    String
  status      PurchaseStatus @default(PENDING)

  paymentId   String?
  promoCode   String?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([userId, courseId])
}

enum PurchaseStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

// Прогресс курса
model CourseProgress {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])

  courseId    String

  progress    Int       @default(0) // процент 0-100
  isCompleted Boolean   @default(false)

  lessons     LessonProgress[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([userId, courseId])
}

// Прогресс урока
model LessonProgress {
  id          String    @id @default(uuid())

  courseProgressId String
  courseProgress   CourseProgress @relation(fields: [courseProgressId], references: [id], onDelete: Cascade)

  lessonId    String
  lesson      Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  isCompleted Boolean   @default(false)
  watchTime   Int       @default(0) // в секундах

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([courseProgressId, lessonId])
}

// Отзывы
model Review {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])

  courseId  String
  course    Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)

  rating    Int       // 1-5
  comment   String?

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@unique([userId, courseId])
}

// Сертификаты
model Certificate {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])

  courseId    String
  certificateUrl String

  issuedAt    DateTime  @default(now())
}

// Промокоды
model PromoCode {
  id          String    @id @default(uuid())
  code        String    @unique
  discount    Int       // процент скидки
  maxUses     Int?
  usedCount   Int       @default(0)

  validFrom   DateTime
  validUntil  DateTime

  isActive    Boolean   @default(true)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

---

## 🔌 API Endpoints

### Аутентификация
```
POST   /api/auth/telegram    - Аутентификация через Telegram
GET    /api/auth/me          - Получить текущего пользователя
```

### Курсы
```
GET    /api/courses                    - Список курсов (с фильтрами)
GET    /api/courses/:id                - Детали курса
POST   /api/courses                    - Создать курс (admin)
PUT    /api/courses/:id                - Обновить курс (admin)
DELETE /api/courses/:id                - Удалить курс (admin)
GET    /api/courses/:id/lessons        - Уроки курса
POST   /api/courses/:id/lessons        - Добавить урок (admin)
PUT    /api/courses/:id/lessons/:lessonId - Обновить урок (admin)
DELETE /api/courses/:id/lessons/:lessonId - Удалить урок (admin)
```

### Пользователи
```
GET    /api/users/me                   - Мой профиль
PUT    /api/users/me                   - Обновить профиль
GET    /api/users/me/courses           - Мои курсы
GET    /api/users/me/purchases         - История покупок
GET    /api/users                      - Список пользователей (admin)
PUT    /api/users/:id/block            - Блокировка пользователя (admin)
```

### Покупки
```
POST   /api/purchases                  - Создать покупку
GET    /api/purchases/:id              - Детали покупки
POST   /api/purchases/:id/confirm      - Подтвердить оплату
```

### Прогресс
```
GET    /api/progress/courses/:courseId - Прогресс курса
POST   /api/progress/lessons/:lessonId - Обновить прогресс урока
```

### Отзывы
```
GET    /api/reviews/courses/:courseId  - Отзывы о курсе
POST   /api/reviews/courses/:courseId  - Оставить отзыв
PUT    /api/reviews/:id                - Обновить отзыв
DELETE /api/reviews/:id                - Удалить отзыв
```

### Промокоды
```
POST   /api/promo/validate             - Проверить промокод
GET    /api/promo                      - Список промокодов (admin)
POST   /api/promo                      - Создать промокод (admin)
DELETE /api/promo/:id                  - Удалить промокод (admin)
```

### Аналитика (admin)
```
GET    /api/analytics/sales            - Статистика продаж
GET    /api/analytics/users            - Статистика пользователей
GET    /api/analytics/courses          - Статистика курсов
```

---

## 📱 Интеграция с Telegram

### Telegram Bot функционал

#### Команды бота:
```
/start              - Запуск Mini App
/courses            - Открыть каталог курсов
/my_courses         - Мои курсы
/profile            - Мой профиль
/support            - Поддержка
```

#### Уведомления:
- Успешная покупка курса
- Новые уроки в курсе
- Напоминания о прохождении
- Скидки и промокоды
- Ответы на отзывы

#### Inline кнопка для запуска Mini App:
```javascript
{
  text: "🎓 Открыть платформу курсов",
  web_app: { url: "https://your-domain.com" }
}
```

### Валидация Telegram данных

```typescript
// Backend проверка initData от Telegram
import crypto from 'crypto';

function validateTelegramWebAppData(initData: string, botToken: string): boolean {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}
```

---

## 💳 Система платежей

### Варианты интеграции:

#### 1. Telegram Payments (рекомендуется)
```typescript
// Создание инвойса
bot.sendInvoice(chatId, {
  title: 'Курс: React для начинающих',
  description: 'Полный курс по React',
  payload: JSON.stringify({ courseId: 'xxx' }),
  provider_token: process.env.PAYMENT_TOKEN,
  currency: 'RUB',
  prices: [{ label: 'Курс', amount: 299000 }], // в копейках
});

// Обработка платежа
bot.on('pre_checkout_query', async (query) => {
  await bot.answerPreCheckoutQuery(query.id, true);
});

bot.on('successful_payment', async (msg) => {
  // Выдать доступ к курсу
});
```

#### 2. ЮKassa / CloudPayments
- Webhook для подтверждения платежа
- Статусы платежей
- Возвраты

#### 3. Криптовалюта (опционально)
- TON Wallet
- USDT

---

## 🔒 Безопасность

### 1. Аутентификация
- Проверка `initData` от Telegram
- JWT токены с коротким временем жизни
- Refresh tokens в httpOnly cookies

### 2. Авторизация
- Role-based access control (RBAC)
- Проверка доступа к курсам
- Middleware для admin роутов

### 3. Защита данных
- HTTPS обязательно
- Валидация входных данных (Zod)
- SQL injection защита (Prisma)
- Rate limiting
- CORS настройка

### 4. Файлы
- Проверка типов файлов
- Ограничение размера
- Вирусная проверка
- CDN для раздачи

---

## 📊 Мониторинг и логирование

```
- Winston (логирование)
- Sentry (отслеживание ошибок)
- Prometheus + Grafana (метрики)
- PostgreSQL медленные запросы
```

---

## 🚀 Масштабирование

### Горизонтальное:
- Load Balancer (Nginx)
- Несколько инстансов backend
- Redis для сессий

### Вертикальное:
- Оптимизация запросов
- Кэширование (Redis)
- CDN для статики
- Database indexes

---

## 📝 Примеры использования

### Frontend: Получение курсов

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(res => res.data),
  });
}

// В компоненте
function CoursesPage() {
  const { data: courses, isLoading } = useCourses();

  if (isLoading) return <Loader />;

  return (
    <div>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

### Backend: Контроллер курсов

```typescript
import { Request, Response } from 'express';
import { prisma } from '@/config/database';

export class CourseController {
  async getCourses(req: Request, res: Response) {
    const { category, level, search } = req.query;

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(category && { categoryId: category as string }),
        ...(level && { level: level as any }),
        ...(search && {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        category: true,
        _count: {
          select: { lessons: true, reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(courses);
  }

  async createCourse(req: Request, res: Response) {
    // Проверка прав админа в middleware
    const course = await prisma.course.create({
      data: req.body,
    });

    res.status(201).json(course);
  }
}
```

---

Эта архитектура обеспечивает:
✅ Масштабируемость
✅ Безопасность
✅ Удобство разработки
✅ Отличный UX
✅ Простоту поддержки
