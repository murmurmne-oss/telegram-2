# 🎓 Telegram Mini App - Платформа Курсов

Полнофункциональная платформа для продажи и обучения онлайн-курсов внутри Telegram.

## 📋 Особенности

- ✅ **Telegram Mini App** - работает полностью внутри Telegram
- ✅ **Полный функционал** - курсы, уроки, прогресс, сертификаты
- ✅ **Платежи** - интеграция с Telegram Payments
- ✅ **Админ панель** - управление курсами и пользователями
- ✅ **Адаптивный дизайн** - под Telegram тему
- ✅ **TypeScript** - типобезопасность на всех уровнях
- ✅ **Prisma ORM** - удобная работа с БД
- ✅ **Docker** - простой деплой

## 🏗 Архитектура

```
telegram-course-app/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite Mini App
├── bot/              # Telegram Bot
└── docker/           # Docker конфигурация
```

## 🚀 Быстрый старт

### 1. Клонирование и установка

```bash
# Клонировать репозиторий
git clone <your-repo>
cd telegram-course-app

# Скопировать .env
cp .env.example .env
# Отредактировать .env и добавить токен бота
```

### 2. Запуск базы данных

```bash
# Запустить PostgreSQL, Redis и MinIO
docker-compose up -d
```

### 3. Backend

```bash
cd backend

# Установить зависимости
npm install

# Применить миграции
npx prisma migrate dev

# Запустить dev сервер
npm run dev
```

Backend запустится на http://localhost:3000

### 4. Frontend

```bash
cd frontend

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

Frontend запустится на http://localhost:5173

### 5. Bot

```bash
cd bot

# Установить зависимости
npm install

# Запустить бота
npm run dev
```

### 6. Настройка Telegram Bot

1. Открой [@BotFather](https://t.me/botfather)
2. Отправь `/newbot` и создай бота
3. Скопируй токен в `.env` → `TELEGRAM_BOT_TOKEN`
4. Настрой Menu Button:
   - `/mybots` → выбери бота
   - Bot Settings → Menu Button
   - Введи URL: `https://your-domain.com` (или ngrok URL для локальной разработки)

### 7. Локальное тестирование через ngrok

```bash
# Установить ngrok
npm install -g ngrok

# Запустить туннель для frontend
ngrok http 5173

# Скопировать HTTPS URL в BotFather
```

## 📚 Документация

- [Архитектура проекта](./ARCHITECTURE.md)
- [Руководство по установке](./SETUP_GUIDE.md)
- [API документация](./docs/API.md) *(скоро)*
- [Telegram Mini Apps Docs](https://core.telegram.org/bots/webapps)

## 🛠 Технологии

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- JWT Authentication

### Frontend
- React 18
- TypeScript
- Vite
- TanStack Query
- Zustand
- Tailwind CSS
- Telegram WebApp SDK

### Bot
- Telegraf
- TypeScript
- Webhooks

## 📦 Production деплой

Подробная инструкция в [SETUP_GUIDE.md](./SETUP_GUIDE.md)

### Быстрый деплой на VPS:

```bash
# 1. На сервере
git clone <your-repo>
cd telegram-course-app

# 2. Настроить .env для production

# 3. Запустить всё через Docker
docker-compose up -d

# 4. Применить миграции
docker exec -it telegram_courses_backend npx prisma migrate deploy
```

### Альтернативные платформы:

- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Railway.app, Render.com, Fly.io
- **Database**: Supabase, Railway, Neon

## 🔐 Безопасность

- ✅ Валидация Telegram WebApp данных
- ✅ JWT аутентификация
- ✅ Rate limiting
- ✅ SQL injection защита (Prisma)
- ✅ CORS настройка
- ✅ Helmet security headers

## 📊 Основные API Endpoints

```
POST   /api/auth/telegram        - Аутентификация
GET    /api/courses              - Список курсов
GET    /api/courses/:id          - Детали курса
POST   /api/purchases            - Создать покупку
GET    /api/progress/:courseId   - Прогресс курса
POST   /api/reviews              - Оставить отзыв
```

Полная документация: [API.md](./docs/API.md)

## 🧪 Тестирование

```bash
# Backend тесты
cd backend
npm test

# Frontend тесты
cd frontend
npm test
```

## 📝 Структура БД

Основные модели:
- **User** - пользователи
- **Course** - курсы
- **Lesson** - уроки
- **Purchase** - покупки
- **Progress** - прогресс обучения
- **Review** - отзывы
- **Certificate** - сертификаты

Полная схема: [backend/prisma/schema.prisma](./backend/prisma/schema.prisma)

## 🤝 Разработка

### Запуск в режиме разработки:

```bash
# Терминал 1: Database
docker-compose up -d

# Терминал 2: Backend
cd backend && npm run dev

# Терминал 3: Frontend
cd frontend && npm run dev

# Терминал 4: Bot
cd bot && npm run dev
```

### Code style:

```bash
# Линтинг
npm run lint

# Исправить автоматически
npm run lint:fix
```

## 📄 Лицензия

MIT

## 🆘 Поддержка

- [Issues](https://github.com/yourusername/telegram-courses/issues)
- Email: support@example.com
- Telegram: @support

## 📈 Roadmap

- [ ] Видеоплеер с прогрессом
- [ ] Домашние задания
- [ ] Сообщество (комментарии)
- [ ] Живые вебинары
- [ ] Мобильные приложения
- [ ] Геймификация

---

**Сделано с ❤️ для образования**
