#!/bin/bash

# API Examples для Backend Telegram Mini App
# Использование: source API_EXAMPLES.sh
# Затем можно вызывать функции: getCourses, createCourse и т.д.

# ==============================================
# Настройка
# ==============================================

# Базовый URL API
API_URL="http://localhost:3000/api"

# Telegram initData (нужно заменить на реальный)
# Получить из Telegram WebApp или сгенерировать через utils/telegram-auth.ts
INIT_DATA="query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1699000000&hash=..."

# Функция для форматирования JSON ответа
format_json() {
  if command -v jq &> /dev/null; then
    jq .
  else
    cat
  fi
}

# ==============================================
# COURSES API
# ==============================================

# Получить все курсы
getCourses() {
  echo "📚 Getting all courses..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/courses?page=1&limit=10" \
    | format_json
}

# Получить курсы с фильтрами
getCoursesFiltered() {
  echo "🔍 Getting filtered courses..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/courses?category=design&level=BEGINNER&sort=rating" \
    | format_json
}

# Получить мои курсы
getMyCourses() {
  echo "📖 Getting my courses..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/courses/my-courses" \
    | format_json
}

# Получить детали курса
getCourse() {
  local courseId=$1
  echo "📚 Getting course $courseId..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/courses/$courseId" \
    | format_json
}

# Получить уроки курса
getCourseLessons() {
  local courseId=$1
  echo "📝 Getting lessons for course $courseId..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/courses/$courseId/lessons" \
    | format_json
}

# Получить прогресс по курсу
getCourseProgress() {
  local courseId=$1
  echo "📊 Getting progress for course $courseId..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/courses/$courseId/progress" \
    | format_json
}

# Купить курс
purchaseCourse() {
  local courseId=$1
  local promoCode=$2
  echo "💳 Purchasing course $courseId..."
  curl -s -X POST \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    -d "{\"promoCode\": \"$promoCode\"}" \
    "$API_URL/courses/$courseId/purchase" \
    | format_json
}

# Оставить отзыв
createReview() {
  local courseId=$1
  local rating=$2
  local comment=$3
  echo "⭐ Creating review for course $courseId..."
  curl -s -X POST \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    -d "{\"rating\": $rating, \"comment\": \"$comment\"}" \
    "$API_URL/courses/$courseId/reviews" \
    | format_json
}

# Получить отзывы
getReviews() {
  local courseId=$1
  echo "💬 Getting reviews for course $courseId..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/courses/$courseId/reviews?page=1&limit=10" \
    | format_json
}

# ==============================================
# LESSONS API
# ==============================================

# Получить урок
getLesson() {
  local lessonId=$1
  echo "📖 Getting lesson $lessonId..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/lessons/$lessonId" \
    | format_json
}

# Обновить прогресс урока
updateLessonProgress() {
  local lessonId=$1
  local watchTime=$2
  local isCompleted=$3
  echo "📊 Updating progress for lesson $lessonId..."
  curl -s -X POST \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    -d "{\"watchTime\": $watchTime, \"isCompleted\": $isCompleted}" \
    "$API_URL/lessons/$lessonId/progress" \
    | format_json
}

# Получить следующий урок
getNextLesson() {
  local lessonId=$1
  echo "➡️ Getting next lesson after $lessonId..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/lessons/$lessonId/next" \
    | format_json
}

# ==============================================
# ADMIN API
# ==============================================

# Проверить права админа
checkAdminAccess() {
  echo "🔐 Checking admin access..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/admin/check-access" \
    | format_json
}

# Получить статистику
getAdminDashboard() {
  echo "📊 Getting admin dashboard..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/admin/dashboard?period=30" \
    | format_json
}

# Создать курс
createCourse() {
  echo "✨ Creating new course..."
  curl -s -X POST \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Test Course",
      "description": "This is a test course",
      "shortDesc": "Test course description",
      "price": 999,
      "categoryId": "cat-id-here",
      "level": "BEGINNER",
      "slug": "test-course-'$(date +%s)'",
      "duration": 120,
      "isPublished": false
    }' \
    "$API_URL/admin/courses" \
    | format_json
}

# Обновить курс
updateCourse() {
  local courseId=$1
  echo "📝 Updating course $courseId..."
  curl -s -X PUT \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Updated Course Title",
      "isPublished": true
    }' \
    "$API_URL/admin/courses/$courseId" \
    | format_json
}

# Удалить курс
deleteCourse() {
  local courseId=$1
  echo "🗑️ Deleting course $courseId..."
  curl -s -X DELETE \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/admin/courses/$courseId" \
    | format_json
}

# Создать урок
createLesson() {
  local courseId=$1
  echo "📝 Creating new lesson for course $courseId..."
  curl -s -X POST \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Test Lesson",
      "description": "This is a test lesson",
      "content": "## Lesson Content\n\nLorem ipsum...",
      "videoUrl": "https://example.com/video.mp4",
      "videoDuration": 300,
      "order": 1,
      "isFree": false
    }' \
    "$API_URL/admin/courses/$courseId/lessons" \
    | format_json
}

# Создать промокод
createPromoCode() {
  echo "🎫 Creating promo code..."
  curl -s -X POST \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    -d '{
      "code": "SALE2024",
      "type": "PERCENTAGE",
      "value": 20,
      "maxUses": 100,
      "validFrom": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
      "validUntil": "'$(date -u -d '+1 year' +%Y-%m-%dT%H:%M:%SZ)'",
      "courseIds": []
    }' \
    "$API_URL/admin/promo-codes" \
    | format_json
}

# Получить пользователей
getUsers() {
  echo "👥 Getting users list..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/admin/users?page=1&limit=20" \
    | format_json
}

# Изменить роль пользователя
changeUserRole() {
  local userId=$1
  local role=$2
  echo "🔑 Changing user $userId role to $role..."
  curl -s -X PUT \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    -d "{\"role\": \"$role\"}" \
    "$API_URL/admin/users/$userId/role" \
    | format_json
}

# Заблокировать пользователя
blockUser() {
  local userId=$1
  local isBlocked=$2
  echo "🚫 Blocking/unblocking user $userId..."
  curl -s -X PUT \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    -d "{\"isBlocked\": $isBlocked}" \
    "$API_URL/admin/users/$userId/block" \
    | format_json
}

# ==============================================
# CERTIFICATES API
# ==============================================

# Получить сертификаты
getCertificates() {
  echo "🎓 Getting my certificates..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/certificates" \
    | format_json
}

# Получить/сгенерировать сертификат
getCertificate() {
  local courseId=$1
  echo "🎓 Getting certificate for course $courseId..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/certificates/$courseId" \
    | format_json
}

# Проверить сертификат
verifyCertificate() {
  local certNumber=$1
  echo "✅ Verifying certificate $certNumber..."
  curl -s -X GET \
    -H "Content-Type: application/json" \
    "$API_URL/certificates/verify/$certNumber" \
    | format_json
}

# ==============================================
# PURCHASES API
# ==============================================

# Получить покупки
getPurchases() {
  echo "💳 Getting purchase history..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/purchases?page=1&limit=10" \
    | format_json
}

# Получить покупку
getPurchase() {
  local purchaseId=$1
  echo "💳 Getting purchase $purchaseId..."
  curl -s -X GET \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    "$API_URL/purchases/$purchaseId" \
    | format_json
}

# Создать invoice
createInvoice() {
  local courseId=$1
  local promoCode=$2
  echo "🧾 Creating invoice for course $courseId..."
  curl -s -X POST \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    -d "{\"courseId\": \"$courseId\", \"promoCode\": \"$promoCode\"}" \
    "$API_URL/purchases/create-invoice" \
    | format_json
}

# Валидировать промокод
validatePromo() {
  local courseId=$1
  local promoCode=$2
  echo "🎫 Validating promo code $promoCode..."
  curl -s -X POST \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    -d "{\"courseId\": \"$courseId\", \"promoCode\": \"$promoCode\"}" \
    "$API_URL/purchases/validate-promo" \
    | format_json
}

# Возврат средств
refundPurchase() {
  local purchaseId=$1
  echo "💸 Refunding purchase $purchaseId..."
  curl -s -X POST \
    -H "X-Telegram-Init-Data: $INIT_DATA" \
    -H "Content-Type: application/json" \
    -d '{"reason": "Test refund"}' \
    "$API_URL/purchases/$purchaseId/refund" \
    | format_json
}

# ==============================================
# HEALTH & INFO
# ==============================================

# Health check
healthCheck() {
  echo "❤️ Health check..."
  curl -s -X GET \
    -H "Content-Type: application/json" \
    "$API_URL/../health" \
    | format_json
}

# API info
apiInfo() {
  echo "ℹ️ API info..."
  curl -s -X GET \
    -H "Content-Type: application/json" \
    "$API_URL/.." \
    | format_json
}

# ==============================================
# HELP
# ==============================================

showHelp() {
  echo "📚 Available commands:"
  echo ""
  echo "Courses:"
  echo "  getCourses              - Get all courses"
  echo "  getCoursesFiltered      - Get filtered courses"
  echo "  getMyCourses            - Get my purchased courses"
  echo "  getCourse <id>          - Get course details"
  echo "  getCourseLessons <id>   - Get course lessons"
  echo "  getCourseProgress <id>  - Get course progress"
  echo "  purchaseCourse <id> [promo] - Purchase course"
  echo "  createReview <id> <rating> <comment> - Create review"
  echo "  getReviews <id>         - Get course reviews"
  echo ""
  echo "Lessons:"
  echo "  getLesson <id>          - Get lesson"
  echo "  updateLessonProgress <id> <time> <completed> - Update progress"
  echo "  getNextLesson <id>      - Get next lesson"
  echo ""
  echo "Admin:"
  echo "  checkAdminAccess        - Check admin access"
  echo "  getAdminDashboard       - Get dashboard stats"
  echo "  createCourse            - Create new course"
  echo "  updateCourse <id>       - Update course"
  echo "  deleteCourse <id>       - Delete course"
  echo "  createLesson <courseId> - Create lesson"
  echo "  createPromoCode         - Create promo code"
  echo "  getUsers                - Get users list"
  echo "  changeUserRole <id> <role> - Change user role"
  echo "  blockUser <id> <true/false> - Block/unblock user"
  echo ""
  echo "Certificates:"
  echo "  getCertificates         - Get my certificates"
  echo "  getCertificate <courseId> - Get certificate"
  echo "  verifyCertificate <number> - Verify certificate"
  echo ""
  echo "Purchases:"
  echo "  getPurchases            - Get purchase history"
  echo "  getPurchase <id>        - Get purchase details"
  echo "  createInvoice <courseId> [promo] - Create invoice"
  echo "  validatePromo <courseId> <code> - Validate promo"
  echo "  refundPurchase <id>     - Refund purchase"
  echo ""
  echo "Other:"
  echo "  healthCheck             - Health check"
  echo "  apiInfo                 - API info"
  echo "  showHelp                - Show this help"
}

# При загрузке файла показываем help
echo "🚀 API Examples loaded!"
echo "Use: source API_EXAMPLES.sh"
echo ""
showHelp
