# Backend API Endpoints Documentation

Полная документация по API endpoints для Telegram Mini App - платформа курсов.

## Аутентификация

Все защищенные endpoints требуют заголовок:
```
X-Telegram-Init-Data: <initData from Telegram WebApp>
```

## 📚 Courses API (`/api/courses`)

### GET /api/courses
Получить все курсы с фильтрами

**Query параметры:**
- `category` - ID категории
- `level` - Уровень сложности (BEGINNER, INTERMEDIATE, ADVANCED)
- `search` - Поиск по названию/описанию
- `sort` - Сортировка (createdAt, price, rating, popular)
- `page` - Номер страницы (по умолчанию 1)
- `limit` - Количество на странице (по умолчанию 12)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "courses": [...],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 50,
      "pages": 5
    }
  }
}
```

### GET /api/courses/my-courses
Получить купленные курсы пользователя

**Ответ:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "...",
        "title": "...",
        "progress": 45,
        "isCompleted": false,
        "purchasedAt": "..."
      }
    ]
  }
}
```

### GET /api/courses/:id
Получить детали курса

**Ответ:**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "...",
      "title": "...",
      "isPurchased": true,
      "lessons": [...]
    }
  }
}
```

### GET /api/courses/:id/lessons
Получить список уроков курса

**Ответ:**
```json
{
  "success": true,
  "data": {
    "lessons": [...],
    "isPurchased": true,
    "progress": [...]
  }
}
```

### GET /api/courses/:id/progress
Получить прогресс по курсу

**Требует:** Курс должен быть куплен

**Ответ:**
```json
{
  "success": true,
  "data": {
    "progress": 75,
    "isCompleted": false,
    "startedAt": "...",
    "lessons": [...]
  }
}
```

### POST /api/courses/:id/purchase
Купить курс

**Body:**
```json
{
  "promoCode": "SALE2024"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "purchase": {
      "id": "...",
      "amount": "999.00",
      "currency": "RUB"
    }
  }
}
```

### POST /api/courses/:id/reviews
Оставить отзыв на курс

**Требует:** Курс должен быть куплен

**Body:**
```json
{
  "rating": 5,
  "comment": "Отличный курс!"
}
```

### GET /api/courses/:id/reviews
Получить отзывы курса

**Query параметры:**
- `page` - Номер страницы (по умолчанию 1)
- `limit` - Количество на странице (по умолчанию 10)

---

## 📖 Lessons API (`/api/lessons`)

### GET /api/lessons/:id
Получить урок по ID

**Требует:** Доступ к курсу (покупка или бесплатный урок)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "lesson": {
      "id": "...",
      "title": "...",
      "content": "...",
      "videoUrl": "...",
      "materials": [...]
    },
    "progress": {
      "isCompleted": false,
      "watchTime": 120
    }
  }
}
```

### POST /api/lessons/:id/progress
Обновить прогресс урока

**Требует:** Курс должен быть куплен

**Body:**
```json
{
  "watchTime": 300,
  "isCompleted": true,
  "notes": "Мои заметки"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "lessonProgress": {...},
    "courseProgress": {
      "progress": 80,
      "isCompleted": false
    }
  }
}
```

### GET /api/lessons/:id/next
Получить следующий урок

**Требует:** Курс должен быть куплен

**Ответ:**
```json
{
  "success": true,
  "data": {
    "nextLesson": {...},
    "isLastLesson": false
  }
}
```

---

## 👨‍💼 Admin API (`/api/admin`)

**Все endpoints требуют роль ADMIN или SUPER_ADMIN**

### GET /api/admin/check-access
Проверка прав админа

### GET /api/admin/dashboard
Получить статистику для админ-панели

**Query параметры:**
- `period` - Период в днях (по умолчанию 30)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 1500,
      "totalCourses": 25,
      "totalRevenue": "150000.00",
      "newStudents": 50,
      "newPurchases": 120
    },
    "popularCourses": [...],
    "recentPurchases": [...],
    "dailyRevenue": [...]
  }
}
```

### POST /api/admin/courses
Создать курс

**Body:**
```json
{
  "title": "Новый курс",
  "description": "...",
  "price": 999,
  "categoryId": "...",
  "slug": "new-course",
  "level": "BEGINNER",
  "isPublished": false
}
```

### PUT /api/admin/courses/:id
Обновить курс

### DELETE /api/admin/courses/:id
Удалить курс

**Важно:** Нельзя удалить курс с существующими покупками

### POST /api/admin/courses/:courseId/lessons
Добавить урок к курсу

**Body:**
```json
{
  "title": "Урок 1",
  "description": "...",
  "content": "...",
  "videoUrl": "...",
  "order": 1,
  "isFree": false
}
```

### PUT /api/admin/lessons/:id
Обновить урок

### DELETE /api/admin/lessons/:id
Удалить урок

### POST /api/admin/promo-codes
Создать промокод

**Body:**
```json
{
  "code": "SALE2024",
  "type": "PERCENTAGE",
  "value": 20,
  "maxUses": 100,
  "validFrom": "2024-01-01",
  "validUntil": "2024-12-31",
  "courseIds": []
}
```

### GET /api/admin/users
Список пользователей

**Query параметры:**
- `page` - Номер страницы
- `limit` - Количество на странице
- `role` - Фильтр по роли
- `search` - Поиск по имени/username
- `isBlocked` - Фильтр по блокировке

### PUT /api/admin/users/:id/role
Изменить роль пользователя

**Требует:** Роль SUPER_ADMIN

**Body:**
```json
{
  "role": "ADMIN"
}
```

### PUT /api/admin/users/:id/block
Заблокировать/разблокировать пользователя

**Body:**
```json
{
  "isBlocked": true
}
```

---

## 🎓 Certificates API (`/api/certificates`)

### GET /api/certificates
Получить все сертификаты пользователя

**Ответ:**
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "id": "...",
        "courseTitle": "...",
        "certificateNumber": "CERT-...",
        "certificateUrl": "...",
        "issuedAt": "..."
      }
    ]
  }
}
```

### GET /api/certificates/:courseId
Получить или сгенерировать сертификат по курсу

**Требует:** Курс должен быть завершен (100% прогресс)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "certificate": {
      "certificateNumber": "CERT-...",
      "certificateUrl": "...",
      "issuedAt": "..."
    }
  }
}
```

### GET /api/certificates/verify/:certificateNumber
Проверить подлинность сертификата (публичный endpoint)

**Не требует аутентификации**

---

## 💳 Purchases API (`/api/purchases`)

### GET /api/purchases
История покупок пользователя

**Query параметры:**
- `page` - Номер страницы
- `limit` - Количество на странице
- `status` - Фильтр по статусу (PENDING, COMPLETED, FAILED, REFUNDED)

### GET /api/purchases/:id
Получить детали покупки

### POST /api/purchases/create-invoice
Создать invoice для Telegram Payments

**Body:**
```json
{
  "courseId": "...",
  "promoCode": "SALE2024"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "purchaseId": "...",
    "invoice": {
      "title": "...",
      "description": "...",
      "payload": "...",
      "currency": "XTR",
      "prices": [...]
    },
    "amount": "999.00"
  }
}
```

### POST /api/purchases/webhook
Webhook для обработки платежей от Telegram

**Body:**
```json
{
  "payload": "purchase-id",
  "status": "success",
  "paymentChargeId": "..."
}
```

### POST /api/purchases/:id/refund
Запрос возврата средств

**Требует:** Роль ADMIN или SUPER_ADMIN

**Body:**
```json
{
  "reason": "Причина возврата"
}
```

### POST /api/purchases/validate-promo
Валидация промокода без создания покупки

**Body:**
```json
{
  "promoCode": "SALE2024",
  "courseId": "..."
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "originalPrice": "999.00",
    "discountAmount": "199.80",
    "finalPrice": "799.20"
  }
}
```

---

## 📁 Структура файлов

### Routes
- `/backend/src/routes/courses.ts` - Endpoints для курсов
- `/backend/src/routes/lessons.ts` - Endpoints для уроков
- `/backend/src/routes/admin.ts` - Endpoints для админ-панели
- `/backend/src/routes/certificates.ts` - Endpoints для сертификатов
- `/backend/src/routes/purchases.ts` - Endpoints для покупок

### Middleware
- `/backend/src/middleware/auth.ts` - Аутентификация через Telegram WebApp
- `/backend/src/middleware/admin.ts` - Проверка прав администратора

### Utils
- `/backend/src/utils/telegram-auth.ts` - Валидация Telegram WebApp initData

---

## 🔐 Аутентификация и безопасность

1. **Telegram WebApp Authentication**
   - Все защищенные endpoints проверяют `X-Telegram-Init-Data` header
   - Валидация hash с использованием bot token
   - Автоматическое создание пользователя при первом входе

2. **Права доступа**
   - USER - обычный пользователь
   - ADMIN - администратор (управление контентом)
   - SUPER_ADMIN - супер-админ (управление пользователями)

3. **Проверка покупок**
   - Доступ к платным урокам только после покупки
   - Проверка статуса покупки (COMPLETED)
   - Автоматическое создание прогресса после покупки

---

## 🚀 Использование

### Пример запроса с Telegram WebApp:

```typescript
import { initData } from '@telegram-apps/sdk';

const response = await fetch('https://api.example.com/api/courses', {
  headers: {
    'X-Telegram-Init-Data': initData,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Обработка ошибок:

Все ошибки возвращаются в формате:
```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP статус коды:
- 200 - Успешно
- 201 - Создано
- 400 - Неверный запрос
- 401 - Не авторизован
- 403 - Доступ запрещен
- 404 - Не найдено
- 500 - Внутренняя ошибка сервера

---

## 📝 Примечания

1. Все цены возвращаются как строки для точности
2. BigInt (telegramId) конвертируется в строку в JSON
3. Пагинация начинается с page=1
4. Все даты в ISO 8601 формате
5. Прогресс курса в процентах (0-100)
6. Время просмотра видео в секундах
