# 🪟 Запуск на Windows - Пошаговая инструкция

## ⚡ Быстрое решение проблем

### Проблема: "Authentication failed against database"

Это значит, что PostgreSQL не запущен или .env файл не загружается.

## 📋 Предварительные требования

1. **Node.js 20+** - [Скачать](https://nodejs.org/)
2. **PostgreSQL 15+** - [Скачать](https://www.postgresql.org/download/windows/)
3. **Git** - [Скачать](https://git-scm.com/download/win)

## 🔧 Установка PostgreSQL на Windows

### Вариант 1: Установка через установщик (Рекомендуется)

1. Скачай PostgreSQL 15 с [официального сайта](https://www.postgresql.org/download/windows/)
2. Запусти установщик
3. При установке запомни:
   - **Password**: `password` (или свой пароль)
   - **Port**: `5432` (по умолчанию)
   - **Username**: `postgres` (по умолчанию)

4. После установки проверь, что PostgreSQL запущен:
   - Открой **Диспетчер задач** → **Службы**
   - Найди `postgresql-x64-15` - должно быть **Выполняется**

### Вариант 2: Docker Desktop (если есть)

1. Установи [Docker Desktop для Windows](https://www.docker.com/products/docker-desktop/)
2. Запусти Docker Desktop
3. В корне проекта выполни:
   ```powershell
   docker-compose up -d
   ```

## 🗄 Создание базы данных

### Через pgAdmin (графический интерфейс):

1. Открой **pgAdmin 4** (установлен вместе с PostgreSQL)
2. Подключись к серверу (пароль который ты ставил при установке)
3. Правый клик на **Databases** → **Create** → **Database**
4. Имя: `telegram_courses`
5. Owner: `postgres`
6. Save

### Через командную строку:

```powershell
# Открой PowerShell от имени администратора
psql -U postgres

# В консоли PostgreSQL:
CREATE DATABASE telegram_courses;
\q
```

## ⚙️ Настройка проекта

### 1. Проверь .env файл

Убедись что в **корне проекта** есть файл `.env` со следующим содержимым:

```env
NODE_ENV=development
PORT=3000

# ВАЖНО: Если ты изменил пароль PostgreSQL, измени его здесь!
DATABASE_URL=postgresql://postgres:password@localhost:5432/telegram_courses?schema=public

TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
WEBAPP_URL=http://localhost:5173

JWT_SECRET=your-super-secret-jwt-key-12345
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-67890
REFRESH_TOKEN_EXPIRES_IN=30d

VITE_API_URL=http://localhost:3000/api
VITE_BOT_USERNAME=your_bot_username

ADMIN_TELEGRAM_ID=123456789
LOG_LEVEL=info
```

**ВАЖНО**: Если при установке PostgreSQL ты использовал другой пароль, измени `password` в `DATABASE_URL`!

Например, если твой пароль `mypass123`:
```
DATABASE_URL=postgresql://postgres:mypass123@localhost:5432/telegram_courses?schema=public
```

### 2. Проверь подключение к PostgreSQL

Открой PowerShell и выполни:

```powershell
# Попробуй подключиться
psql -U postgres -d telegram_courses

# Если подключение успешно, увидишь:
# telegram_courses=#

# Выйди:
\q
```

Если ошибка "psql is not recognized":
- Добавь PostgreSQL в PATH: `C:\Program Files\PostgreSQL\15\bin`
- Или используй полный путь: `"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres`

## 🚀 Запуск проекта

### 1. Backend

```powershell
# Открой PowerShell в папке проекта
cd backend

# Установи зависимости (только первый раз)
npm install

# Примени миграции базы данных
npx prisma migrate dev --name init

# Сгенерируй Prisma Client
npx prisma generate

# Запусти dev сервер
npm run dev
```

**Ожидаемый вывод:**
```
2025-10-31 22:00:00 [info]: Prisma connected to database
2025-10-31 22:00:00 [info]: Server is running on port 3000
2025-10-31 22:00:00 [info]: Environment: development
2025-10-31 22:00:00 [info]: API URL: http://localhost:3000
```

✅ Если видишь это - **Backend работает!**

### 2. Frontend (новое окно PowerShell)

```powershell
cd frontend

# Установи зависимости (только первый раз)
npm install

# Запусти dev сервер
npm run dev
```

**Ожидаемый вывод:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ Frontend готов! Открой http://localhost:5173

### 3. Bot (новое окно PowerShell)

```powershell
cd bot

# Установи зависимости (только первый раз)
npm install

# Запусти бота
npm run dev
```

**Ожидаемый вывод:**
```
2025-10-31 22:00:00 [info]: Bot started successfully
2025-10-31 22:00:00 [info]: Bot username: @your_bot_username
```

✅ Бот работает!

## 🐛 Решение проблем

### Ошибка: "Authentication failed against database"

**Причина**: PostgreSQL не запущен или неправильные credentials

**Решение**:
1. Проверь что PostgreSQL запущен (Диспетчер задач → Службы)
2. Проверь пароль в `.env` файле в строке `DATABASE_URL`
3. Попробуй подключиться вручную: `psql -U postgres -d telegram_courses`

### Ошибка: "Port 3000 is already in use"

**Причина**: Другое приложение использует порт 3000

**Решение**:
```powershell
# Найди процесс на порту 3000
netstat -ano | findstr :3000

# Останови процесс (замени PID на ID из предыдущей команды)
taskkill /PID <PID> /F

# Или измени порт в .env:
PORT=3001
```

### Ошибка: "prisma migrate" не работает

**Решение**:
```powershell
# Очисти кэш
npx prisma generate --force

# Примени миграции заново
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Ошибка: "Cannot find module"

**Решение**:
```powershell
# Удали node_modules и переустанови
rm -r node_modules
rm package-lock.json
npm install
```

### Frontend не подключается к Backend

**Проверь**:
1. Backend запущен на порту 3000
2. В `.env` указан правильный `VITE_API_URL=http://localhost:3000/api`
3. Перезапусти Frontend после изменения `.env`

## 📊 Проверка что всё работает

### 1. Backend API
Открой в браузере: http://localhost:3000/api/health

Должно вернуть:
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T22:00:00.000Z",
  "uptime": 123.456
}
```

### 2. Frontend
Открой: http://localhost:5173

Должна отобразиться страница Mini App

### 3. База данных
```powershell
cd backend
npx prisma studio
```

Откроется http://localhost:5555 - графический интерфейс для БД

## 🎯 Следующие шаги

1. **Создай Telegram Bot**:
   - Открой [@BotFather](https://t.me/botfather)
   - Отправь `/newbot`
   - Получи токен и добавь в `.env` → `TELEGRAM_BOT_TOKEN`

2. **Настрой ngrok** для локального тестирования:
   ```powershell
   # Установи ngrok
   npm install -g ngrok

   # Запусти туннель
   ngrok http 5173

   # Скопируй HTTPS URL и добавь в Menu Button бота
   ```

3. **Добавь тестовые данные**:
   - Открой Prisma Studio: `npx prisma studio`
   - Создай категорию
   - Создай курс
   - Создай уроки

## 📝 Полезные команды

```powershell
# Проверка версии Node.js
node --version

# Проверка версии npm
npm --version

# Проверка PostgreSQL
psql --version

# Просмотр логов Backend
cd backend && npm run dev

# Очистка всех node_modules (если что-то сломалось)
rm -r backend/node_modules
rm -r frontend/node_modules
rm -r bot/node_modules
```

## 🆘 Всё ещё не работает?

1. Убедись что все 3 части запущены (Backend, Frontend, Bot)
2. Проверь что PostgreSQL запущен
3. Проверь .env файл
4. Попробуй перезапустить всё заново
5. Посмотри логи на наличие ошибок

---

**После успешного запуска переходи к [QUICK_START.md](./QUICK_START.md) для настройки Telegram Bot!** 🚀
