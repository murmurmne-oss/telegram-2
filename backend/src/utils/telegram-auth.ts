import crypto from 'crypto';

/**
 * Интерфейс для данных пользователя Telegram WebApp
 */
export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

/**
 * Интерфейс для initData Telegram WebApp
 */
export interface TelegramInitData {
  query_id?: string;
  user?: TelegramWebAppUser;
  receiver?: TelegramWebAppUser;
  chat?: any;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

/**
 * Валидация данных Telegram WebApp
 *
 * @param initData - Строка initData от Telegram WebApp
 * @param botToken - Token бота Telegram
 * @returns true если данные валидны, false в противном случае
 */
export function validateTelegramWebAppData(
  initData: string,
  botToken: string
): boolean {
  try {
    if (!initData || !botToken) {
      return false;
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
      return false;
    }

    // Удаляем hash из параметров
    urlParams.delete('hash');

    // Создаём строку для проверки (сортировка по ключам)
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаём секретный ключ из токена бота
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Вычисляем hash от данных
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Сравниваем hash
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating Telegram WebApp data:', error);
    return false;
  }
}

/**
 * Парсинг данных Telegram WebApp
 *
 * @param initData - Строка initData от Telegram WebApp
 * @returns Распарсенные данные пользователя
 */
export function parseTelegramWebAppData(initData: string): TelegramInitData {
  const urlParams = new URLSearchParams(initData);
  const result: any = {};

  // Парсим все параметры
  urlParams.forEach((value, key) => {
    if (key === 'user' || key === 'receiver' || key === 'chat') {
      try {
        result[key] = JSON.parse(value);
      } catch (error) {
        console.error(`Error parsing ${key}:`, error);
        result[key] = null;
      }
    } else if (key === 'auth_date' || key === 'can_send_after') {
      result[key] = parseInt(value, 10);
    } else {
      result[key] = value;
    }
  });

  return result as TelegramInitData;
}

/**
 * Извлечение данных пользователя из initData
 *
 * @param initData - Строка initData от Telegram WebApp
 * @returns Данные пользователя или null
 */
export function extractUserFromInitData(
  initData: string
): TelegramWebAppUser | null {
  try {
    const parsed = parseTelegramWebAppData(initData);
    return parsed.user || null;
  } catch (error) {
    console.error('Error extracting user from initData:', error);
    return null;
  }
}

/**
 * Проверка актуальности auth_date (не старше заданного времени)
 *
 * @param initData - Строка initData от Telegram WebApp
 * @param maxAgeSeconds - Максимальный возраст данных в секундах (по умолчанию 86400 = 24 часа)
 * @returns true если данные актуальны, false в противном случае
 */
export function isAuthDateValid(
  initData: string,
  maxAgeSeconds: number = 86400
): boolean {
  try {
    const parsed = parseTelegramWebAppData(initData);
    const authDate = parsed.auth_date;

    if (!authDate) {
      return false;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const age = currentTimestamp - authDate;

    return age <= maxAgeSeconds && age >= 0;
  } catch (error) {
    console.error('Error checking auth_date:', error);
    return false;
  }
}

/**
 * Полная валидация Telegram WebApp данных
 * Проверяет и hash, и актуальность auth_date
 *
 * @param initData - Строка initData от Telegram WebApp
 * @param botToken - Token бота Telegram
 * @param maxAgeSeconds - Максимальный возраст данных в секундах
 * @returns Объект с результатом валидации и данными пользователя
 */
export function validateAndExtractTelegramData(
  initData: string,
  botToken: string,
  maxAgeSeconds: number = 86400
): {
  isValid: boolean;
  user: TelegramWebAppUser | null;
  error?: string;
} {
  // Проверка наличия данных
  if (!initData) {
    return {
      isValid: false,
      user: null,
      error: 'Init data is missing',
    };
  }

  if (!botToken) {
    return {
      isValid: false,
      user: null,
      error: 'Bot token is not configured',
    };
  }

  // Проверка hash
  const isHashValid = validateTelegramWebAppData(initData, botToken);
  if (!isHashValid) {
    return {
      isValid: false,
      user: null,
      error: 'Invalid hash',
    };
  }

  // Проверка актуальности auth_date
  const isDateValid = isAuthDateValid(initData, maxAgeSeconds);
  if (!isDateValid) {
    return {
      isValid: false,
      user: null,
      error: 'Auth date is expired or invalid',
    };
  }

  // Извлечение данных пользователя
  const user = extractUserFromInitData(initData);
  if (!user) {
    return {
      isValid: false,
      user: null,
      error: 'User data not found in init data',
    };
  }

  return {
    isValid: true,
    user,
  };
}

/**
 * Создание hash для тестирования (использовать только для разработки!)
 *
 * @param data - Данные для хеширования
 * @param botToken - Token бота
 * @returns Hash строка
 */
export function createTestHash(data: Record<string, string>, botToken: string): string {
  const dataCheckString = Object.entries(data)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  return crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
}

/**
 * Генерация тестового initData (использовать только для разработки!)
 *
 * @param user - Данные пользователя
 * @param botToken - Token бота
 * @returns Строка initData
 */
export function generateTestInitData(
  user: TelegramWebAppUser,
  botToken: string
): string {
  const authDate = Math.floor(Date.now() / 1000);
  const data: Record<string, string> = {
    user: JSON.stringify(user),
    auth_date: authDate.toString(),
    query_id: 'test_query_id',
  };

  const hash = createTestHash(data, botToken);
  data.hash = hash;

  return new URLSearchParams(data).toString();
}
