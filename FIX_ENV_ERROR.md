# ⚡ СРОЧНОЕ ИСПРАВЛЕНИЕ - Environment variable not found: DATABASE_URL

## Проблема
Backend не может найти переменную `DATABASE_URL` потому что .env файл не загружается.

## ✅ БЫСТРОЕ РЕШЕНИЕ (3 шага)

### Шаг 1: Создай .env файл вручную

В **корне проекта** (там где docker-compose.yml) создай файл `.env`:

**Windows (PowerShell):**
```powershell
# В корне проекта G:\telegram_courses_miniapp\
New-Item -Path .env -ItemType File
```

Или просто создай через Блокнот: **Файл → Сохранить как** → `.env` (выбери "Все файлы")

### Шаг 2: Вставь содержимое в .env

Открой `.env` в блокноте и вставь:

```env
NODE_ENV=development
PORT=3000

# ВАЖНО: Если пароль PostgreSQL другой - измени здесь!
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

**ВАЖНО**: Если при установке PostgreSQL ты использовал другой пароль, измени `password` в строке `DATABASE_URL`!

### Шаг 3: Перезапусти backend

```powershell
cd backend

# Проверь что .env создан
npm run check-env

# Если всё ОК, запусти:
npm run dev
```

## 📋 ИЛИ используй автоматическую настройку:

```powershell
cd backend

# Это автоматически создаст .env, применит миграции
npm run setup

# Затем запусти
npm run dev
```

## ✅ Что должно получиться:

```
🔍 Checking .env file...
✅ .env file exists!
✅ DATABASE_URL is configured!

📍 .env file location: G:\telegram_courses_miniapp\.env

2025-10-31 23:00:00 [info]: Prisma connected to database
2025-10-31 23:00:00 [info]: Server is running on port 3000
```

## 🐛 Если всё ещё ошибка:

### Проверь что PostgreSQL запущен:

```powershell
# Проверь службу
Get-Service | Where-Object {$_.Name -like "*postgresql*"}

# Должно быть Status: Running
```

### Попробуй подключиться к БД вручную:

```powershell
psql -U postgres -d telegram_courses
```

Если просит пароль - введи тот, что ставил при установке.

Если подключение успешно - значит проблема в .env файле.
Если ошибка - значит PostgreSQL не запущен или неправильный пароль.

### Проверь путь к .env:

```powershell
# Должен быть в корне проекта
ls G:\telegram_courses_miniapp\.env

# Если "Не удается найти элемент" - файл не создан!
```

## 💡 Альтернативное решение (для dev режима):

Можешь временно установить DATABASE_URL в PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://postgres:ТвойПароль@localhost:5432/telegram_courses?schema=public"

cd backend
npm run dev
```

Но лучше создать .env файл!

## 📞 Нужна помощь?

1. Убедись что PostgreSQL установлен и запущен
2. Убедись что база данных `telegram_courses` создана
3. Убедись что .env файл создан в **корне проекта** (не в папке backend!)
4. Убедись что пароль в DATABASE_URL правильный

---

После исправления всё должно работать! 🚀
