# ⚡ Быстрый старт за 5 минут

Этот гайд поможет тебе запустить проект максимально быстро.

## Шаг 1: Создать Telegram Bot (2 мин)

1. Открой [@BotFather](https://t.me/botfather) в Telegram
2. Отправь `/newbot`
3. Введи имя: `My Course Platform`
4. Введи username: `my_course_platform_bot`
5. **Сохрани токен** - он нужен для следующего шага

## Шаг 2: Настроить окружение (1 мин)

```bash
# В корне проекта
cp .env.example .env

# Открой .env и замени:
TELEGRAM_BOT_TOKEN=ВАШ_ТОКЕН_ОТ_BOTFATHER
TELEGRAM_BOT_USERNAME=ваш_бот_username
```

## Шаг 3: Запустить базу данных (30 сек)

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL на порту 5432
- Redis на порту 6379
- MinIO на порту 9000

## Шаг 4: Установить зависимости и запустить (1.5 мин)

### Backend:
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

Должно появиться: `Server is running on port 3000`

### Frontend (новый терминал):
```bash
cd frontend
npm install
npm run dev
```

Должно появиться: `Local: http://localhost:5173`

### Bot (новый терминал):
```bash
cd bot
npm install
npm run dev
```

Должно появиться: `Bot started successfully`

## Шаг 5: Настроить ngrok для локального тестирования (1 мин)

```bash
# Установить ngrok (если не установлен)
npm install -g ngrok

# Запустить туннель
ngrok http 5173
```

Скопируй HTTPS URL (например: `https://abc123.ngrok.io`)

## Шаг 6: Настроить Menu Button в боте (30 сек)

1. Открой [@BotFather](https://t.me/botfather)
2. Отправь `/mybots`
3. Выбери своего бота
4. **Bot Settings** → **Menu Button**
5. **Configure menu button**
6. Текст кнопки: `🎓 Открыть курсы`
7. URL: вставь свой ngrok URL

## Шаг 7: Тестируем! 🎉

1. Найди своего бота в Telegram
2. Отправь `/start`
3. Нажми на кнопку меню внизу
4. Должно открыться Mini App!

---

## ✅ Чек-лист готовности

- [ ] Docker контейнеры запущены (`docker ps`)
- [ ] Backend работает (http://localhost:3000/api/health)
- [ ] Frontend работает (http://localhost:5173)
- [ ] Bot отвечает на `/start`
- [ ] ngrok туннель работает
- [ ] Menu Button настроен
- [ ] Mini App открывается в Telegram

---

## 🐛 Проблемы?

### Backend не запускается
```bash
# Проверь что PostgreSQL работает
docker ps | grep postgres

# Проверь подключение
cd backend
npx prisma studio
```

### Bot не отвечает
```bash
# Проверь токен в .env
echo $TELEGRAM_BOT_TOKEN

# Перезапусти бота
cd bot
npm run dev
```

### Mini App не открывается
- Убедись что ngrok работает и URL правильный
- Проверь что frontend запущен
- Попробуй очистить кэш Telegram (Settings → Advanced → Clear cache)

---

## 🎯 Что дальше?

1. **Добавить первого админа**:
   - Узнай свой Telegram ID через [@userinfobot](https://t.me/userinfobot)
   - Добавь в `.env`: `ADMIN_TELEGRAM_ID=твой_id`
   - Перезапусти backend и bot

2. **Создать тестовые данные**:
   ```bash
   cd backend
   npx prisma studio
   # Добавь категорию и курс вручную через UI
   ```

3. **Изучить код**:
   - Backend API: `backend/src/controllers/`
   - Frontend компоненты: `frontend/src/components/`
   - Bot обработчики: `bot/src/handlers/`

4. **Прочитать полную документацию**:
   - [ARCHITECTURE.md](./ARCHITECTURE.md)
   - [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

**Готово! Теперь у тебя работающий Telegram Mini App! 🚀**
