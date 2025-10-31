# 🚀 Руководство по установке и запуску

## 📋 Содержание
1. [Требования](#требования)
2. [Создание Telegram Bot](#создание-telegram-bot)
3. [Установка зависимостей](#установка-зависимостей)
4. [Настройка окружения](#настройка-окружения)
5. [Настройка базы данных](#настройка-базы-данных)
6. [Запуск в режиме разработки](#запуск-в-режиме-разработки)
7. [Деплой в production](#деплой-в-production)
8. [Настройка домена и SSL](#настройка-домена-и-ssl)

---

## ✅ Требования

### Локальная разработка:
```
- Node.js 20+ (рекомендуется 20.x LTS)
- npm или yarn
- Docker и Docker Compose (для БД)
- Git
```

### Production:
```
- VPS сервер (Ubuntu 22.04 рекомендуется)
- Минимум 2GB RAM
- Домен с SSL сертификатом
- PostgreSQL 15+
- Redis (опционально, для production)
```

---

## 🤖 Создание Telegram Bot

### Шаг 1: Создать бота через @BotFather

1. Открой Telegram и найди [@BotFather](https://t.me/botfather)
2. Отправь команду `/newbot`
3. Введи имя бота (например: "Мои курсы")
4. Введи username бота (например: "my_courses_app_bot")
5. **Сохрани токен бота** - он понадобится позже

```
Done! Congratulations on your new bot.
Token: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Шаг 2: Настроить Mini App

1. Отправь команду `/mybots` в BotFather
2. Выбери своего бота
3. Нажми **"Bot Settings"** → **"Menu Button"**
4. Выбери **"Configure menu button"**
5. Введи текст кнопки: `🎓 Открыть курсы`
6. Введи URL твоего Mini App (пока можно пропустить, настроим позже)

### Шаг 3: Настроить платежи (опционально)

1. В BotFather отправь `/mybots`
2. Выбери своего бота → **"Payments"**
3. Выбери провайдера (например, ЮKassa)
4. Следуй инструкциям для подключения

---

## 📦 Установка зависимостей

### Клонирование и структура проекта

Проект уже создан, теперь создадим структуру:

```bash
# Убедись что находишься в корне проекта
cd /home/user/telegram-2

# Создаём структуру папок (будет автоматически при инициализации)
```

---

## ⚙️ Настройка окружения

### 1. Environment Variables

Создай файл `.env` в корне проекта:

```env
# ======================
# ОБЩИЕ НАСТРОЙКИ
# ======================
NODE_ENV=development
PORT=3000

# ======================
# TELEGRAM BOT
# ======================
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=my_courses_app_bot
WEBAPP_URL=https://your-domain.com

# ======================
# DATABASE
# ======================
DATABASE_URL=postgresql://postgres:password@localhost:5432/telegram_courses?schema=public

# ======================
# JWT
# ======================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# ======================
# REDIS (опционально)
# ======================
REDIS_URL=redis://localhost:6379

# ======================
# ПЛАТЕЖИ
# ======================
# YooKassa
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key

# Telegram Payments
PAYMENT_PROVIDER_TOKEN=your_payment_provider_token

# ======================
# AWS S3 / MinIO (для медиа)
# ======================
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=course-videos
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_REGION=us-east-1

# ======================
# FRONTEND
# ======================
VITE_API_URL=http://localhost:3000/api
VITE_BOT_USERNAME=my_courses_app_bot

# ======================
# ADMIN
# ======================
# Telegram ID первого админа (узнай свой ID через @userinfobot)
ADMIN_TELEGRAM_ID=123456789

# ======================
# МОНИТОРИНГ (production)
# ======================
SENTRY_DSN=your_sentry_dsn
```

### 2. Docker Compose для локальной разработки

Создай `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: telegram_courses_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: telegram_courses
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    container_name: telegram_courses_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # MinIO для локального тестирования файлов (альтернатива S3)
  minio:
    image: minio/minio
    container_name: telegram_courses_minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## 🗄 Настройка базы данных

### 1. Запустить PostgreSQL

```bash
# Запустить Docker контейнеры
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Проверить что контейнеры работают
docker ps
```

### 2. Применить миграции Prisma

```bash
# Перейти в папку backend (после создания структуры)
cd backend

# Установить зависимости
npm install

# Применить миграции
npx prisma migrate dev --name init

# Сгенерировать Prisma Client
npx prisma generate

# (Опционально) Наполнить тестовыми данными
npx prisma db seed
```

### 3. Открыть Prisma Studio (GUI для БД)

```bash
npx prisma studio
# Откроется на http://localhost:5555
```

---

## 🏃 Запуск в режиме разработки

### Терминал 1: Backend API

```bash
cd backend
npm install
npm run dev

# Backend запустится на http://localhost:3000
```

### Терминал 2: Frontend (Mini App)

```bash
cd frontend
npm install
npm run dev

# Frontend запустится на http://localhost:5173
```

### Терминал 3: Telegram Bot

```bash
cd bot
npm install
npm run dev

# Bot запустится и будет слушать команды
```

### Проверка работы

1. **Backend API**: Открой http://localhost:3000/api/health
   - Должен вернуть: `{"status": "ok"}`

2. **Frontend**: Открой http://localhost:5173
   - Должна открыться главная страница Mini App

3. **Bot**: Отправь `/start` своему боту в Telegram
   - Бот должен ответить приветствием

---

## 🌐 Локальное тестирование Telegram Mini App

Telegram Mini Apps работают только через HTTPS. Для локальной разработки:

### Вариант 1: ngrok (самый простой)

```bash
# Установить ngrok
npm install -g ngrok

# Запустить туннель для frontend
ngrok http 5173

# ngrok выдаст URL типа: https://abc123.ngrok.io
```

Теперь:
1. Скопируй HTTPS URL от ngrok
2. Открой @BotFather → твой бот → Menu Button
3. Вставь ngrok URL в поле Web App URL
4. Нажми кнопку меню в боте - откроется твой Mini App!

### Вариант 2: Cloudflare Tunnel

```bash
# Установить cloudflared
npm install -g cloudflared

# Запустить туннель
cloudflared tunnel --url http://localhost:5173
```

### Вариант 3: Деплой на тестовый сервер

Можно сразу задеплоить на Vercel/Netlify для frontend и Railway/Render для backend.

---

## 📱 Тестирование Bot команд

### Основные команды для тестирования:

```
/start          - Приветствие и запуск Mini App
/courses        - Открыть каталог курсов
/my_courses     - Мои курсы
/profile        - Профиль пользователя
/admin          - Админ панель (только для админов)
/help           - Помощь
```

### Тестирование платежей:

```bash
# В тестовом режиме используй test провайдер
# Номер карты для тестов: 1111 1111 1111 1026
# CVC: любой, Срок: любой будущий
```

---

## 🚀 Деплой в Production

### Вариант 1: VPS (Digital Ocean, Hetzner, etc.)

#### 1. Подготовка сервера

```bash
# SSH подключение к серверу
ssh root@your-server-ip

# Обновление системы
apt update && apt upgrade -y

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Установка Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Nginx
apt install -y nginx

# Установка Certbot для SSL
apt install -y certbot python3-certbot-nginx

# Установка PM2
npm install -g pm2
```

#### 2. Клонирование проекта

```bash
# Создать пользователя для приложения
adduser telegram-app
usermod -aG sudo telegram-app
su - telegram-app

# Клонировать репозиторий
git clone https://github.com/yourusername/telegram-courses.git
cd telegram-courses

# Скопировать .env
cp .env.example .env
nano .env  # Настроить production переменные
```

#### 3. Настройка БД

```bash
# Запустить PostgreSQL и Redis
docker-compose up -d

# Применить миграции
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
```

#### 4. Сборка и запуск

```bash
# Backend
cd backend
npm install --production
npm run build
pm2 start dist/index.js --name telegram-api

# Frontend
cd ../frontend
npm install
npm run build
# Собранные файлы в dist/ будут раздаваться через Nginx

# Bot
cd ../bot
npm install --production
npm run build
pm2 start dist/index.js --name telegram-bot

# Сохранить PM2 для автозапуска
pm2 save
pm2 startup
```

#### 5. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/telegram-courses
```

```nginx
# Frontend (Mini App)
server {
    listen 80;
    server_name your-domain.com;

    root /home/telegram-app/telegram-courses/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy для API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Активировать конфиг
sudo ln -s /etc/nginx/sites-available/telegram-courses /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Настройка SSL

```bash
sudo certbot --nginx -d your-domain.com
# Certbot автоматически настроит HTTPS редирект
```

#### 7. Обновить Bot URL

1. Открой @BotFather
2. Настрой Menu Button URL на `https://your-domain.com`
3. Готово!

---

### Вариант 2: Serverless / PaaS

#### Frontend: Vercel

```bash
cd frontend

# Установить Vercel CLI
npm i -g vercel

# Деплой
vercel

# Production деплой
vercel --prod
```

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

#### Backend: Railway.app / Render.com

1. Создай аккаунт на Railway.app
2. Подключи GitHub репозиторий
3. Выбери папку `backend`
4. Добавь environment variables из `.env`
5. Deploy!

Railway автоматически:
- Установит зависимости
- Запустит миграции
- Запустит приложение

---

## 🔧 Настройка домена и SSL

### 1. DNS настройки

В панели управления доменом (Cloudflare, Namecheap и т.д.):

```
Type    Name    Value
A       @       your-server-ip
CNAME   www     your-domain.com
```

### 2. SSL сертификат

```bash
# Автоматически через Certbot (бесплатно)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Или через Cloudflare (бесплатно + CDN)
# Включи "Flexible SSL" в Cloudflare dashboard
```

---

## 📊 Мониторинг и логи

### PM2 команды:

```bash
# Посмотреть статус
pm2 status

# Логи
pm2 logs telegram-api
pm2 logs telegram-bot

# Мониторинг
pm2 monit

# Перезапуск
pm2 restart all

# Остановка
pm2 stop all
```

### База данных:

```bash
# Подключиться к PostgreSQL
docker exec -it telegram_courses_db psql -U postgres -d telegram_courses

# Бэкап
docker exec telegram_courses_db pg_dump -U postgres telegram_courses > backup.sql

# Восстановление
cat backup.sql | docker exec -i telegram_courses_db psql -U postgres -d telegram_courses
```

---

## 🐛 Troubleshooting

### Проблема: Mini App не открывается в Telegram

**Решение:**
1. Убедись что URL использует HTTPS
2. Проверь что сертификат валидный
3. Откройте URL в браузере - должен работать
4. Проверь настройки Menu Button в BotFather

### Проблема: "Failed to verify Telegram data"

**Решение:**
1. Проверь что `TELEGRAM_BOT_TOKEN` правильный
2. Убедись что валидация initData включена на backend
3. Проверь системное время на сервере

### Проблема: База данных не подключается

**Решение:**
```bash
# Проверить работу контейнера
docker ps | grep postgres

# Проверить логи
docker logs telegram_courses_db

# Пересоздать контейнер
docker-compose down
docker-compose up -d
```

### Проблема: PM2 процессы падают

**Решение:**
```bash
# Посмотреть ошибки
pm2 logs --err

# Увеличить memory limit
pm2 start app.js --max-memory-restart 500M
```

---

## 🎯 Чек-лист перед запуском

- [ ] Создан Telegram Bot через @BotFather
- [ ] Получен токен бота
- [ ] Настроены environment variables
- [ ] База данных запущена и мигрирована
- [ ] Backend API работает
- [ ] Frontend собран и доступен
- [ ] Bot отвечает на команды
- [ ] Настроен домен и SSL
- [ ] Menu Button ведёт на Mini App
- [ ] Протестированы платежи (тестовый режим)
- [ ] Создан первый admin пользователь
- [ ] Настроен мониторинг
- [ ] Настроены бэкапы БД

---

## 📚 Полезные ссылки

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Telegram WebApp](https://github.com/Telegram-Mini-Apps/telegram-apps)

---

## 🆘 Поддержка

Если возникли проблемы:
1. Проверь логи: `pm2 logs`
2. Проверь статус сервисов: `pm2 status` и `docker ps`
3. Проверь переменные окружения
4. Перезапусти сервисы: `pm2 restart all`

---

**Готово! Теперь у тебя есть полноценный Telegram Mini App для продажи курсов! 🎉**
