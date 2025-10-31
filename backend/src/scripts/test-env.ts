import dotenv from 'dotenv';
import path from 'path';

// Загружаем .env
const envPath = path.resolve(__dirname, '../../.env');
console.log('🔍 Loading .env from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env:', result.error);
} else {
  console.log('✅ .env loaded successfully');
}

// Проверяем DATABASE_URL
console.log('📊 Environment check:');
console.log('  - NODE_ENV:', process.env.NODE_ENV || '(not set)');
console.log('  - PORT:', process.env.PORT || '(not set)');
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ NOT SET');

if (process.env.DATABASE_URL) {
  // Показываем только первые символы для безопасности
  const dbUrl = process.env.DATABASE_URL;
  console.log('  - DATABASE_URL preview:', dbUrl.substring(0, 30) + '...');
} else {
  console.error('❌ DATABASE_URL is not loaded!');
  console.log('\n📝 Please check:');
  console.log('  1. .env file exists in:', path.resolve(__dirname, '../../'));
  console.log('  2. .env file contains: DATABASE_URL=postgresql://...');
  console.log('  3. File encoding is UTF-8 (not UTF-16)');
  process.exit(1);
}
