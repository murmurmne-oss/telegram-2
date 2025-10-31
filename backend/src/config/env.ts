import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Попытка загрузить .env из нескольких мест
const possiblePaths = [
  path.resolve(__dirname, '../../.env'),           // backend/.env
  path.resolve(__dirname, '../../../.env'),         // root/.env
  path.resolve(__dirname, '../../.env.local'),      // backend/.env.local
  path.resolve(process.cwd(), '.env'),             // текущая директория
];

let loaded = false;

for (const envPath of possiblePaths) {
  if (fs.existsSync(envPath)) {
    console.log(`🔍 Trying to load .env from: ${envPath}`);
    const result = dotenv.config({ path: envPath });

    if (!result.error && process.env.DATABASE_URL) {
      console.log(`✅ Successfully loaded .env from: ${envPath}`);
      loaded = true;
      break;
    }
  }
}

if (!loaded) {
  console.error('❌ Failed to load .env file from any location!');
  console.error('Tried paths:');
  possiblePaths.forEach(p => console.error(`  - ${p}`));

  console.error('\n📝 Creating fallback .env with Docker defaults...');

  // Fallback для Docker
  process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/telegram_courses?schema=public';
  process.env.PORT = '3000';
  process.env.NODE_ENV = 'development';
  process.env.JWT_SECRET = 'fallback-jwt-secret-12345';
  process.env.JWT_EXPIRES_IN = '7d';

  console.log('⚠️  Using fallback environment variables');
}

// Валидация обязательных переменных
const required = ['DATABASE_URL'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`  - ${key}`));
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log(`📊 DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 40)}...`);

export default process.env;
