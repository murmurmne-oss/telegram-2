import fs from 'fs';
import path from 'path';

// Путь к корню проекта (3 уровня вверх от backend/src/scripts)
const envPath = path.resolve(__dirname, '../../../.env');
const envExamplePath = path.resolve(__dirname, '../../../.env.example');

console.log('🔍 Checking .env file...');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found!');

  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Copying from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
    console.log('⚠️  IMPORTANT: Edit .env file and set your DATABASE_URL and TELEGRAM_BOT_TOKEN');
  } else {
    console.log('❌ .env.example not found! Creating default .env...');

    const defaultEnv = `# ======================
# GENERAL
# ======================
NODE_ENV=development
PORT=3000

# ======================
# DATABASE
# ======================
# ВАЖНО: Измени пароль если у тебя другой!
DATABASE_URL=postgresql://postgres:password@localhost:5432/telegram_courses?schema=public

# ======================
# TELEGRAM BOT
# ======================
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
WEBAPP_URL=http://localhost:5173

# ======================
# JWT
# ======================
JWT_SECRET=your-super-secret-jwt-key-12345
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-67890
REFRESH_TOKEN_EXPIRES_IN=30d

# ======================
# FRONTEND
# ======================
VITE_API_URL=http://localhost:3000/api
VITE_BOT_USERNAME=your_bot_username

# ======================
# ADMIN
# ======================
ADMIN_TELEGRAM_ID=123456789
LOG_LEVEL=info
`;

    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ Default .env file created!');
    console.log('⚠️  IMPORTANT: Edit .env file and set your DATABASE_URL and TELEGRAM_BOT_TOKEN');
  }
} else {
  console.log('✅ .env file exists!');

  // Проверяем что DATABASE_URL установлен
  const envContent = fs.readFileSync(envPath, 'utf-8');

  if (!envContent.includes('DATABASE_URL=') || envContent.includes('DATABASE_URL=postgresql://postgres:password@localhost')) {
    console.log('⚠️  DATABASE_URL not properly configured!');
    console.log('📝 Make sure to set your PostgreSQL password in DATABASE_URL');
  } else {
    console.log('✅ DATABASE_URL is configured!');
  }
}

console.log('\n📍 .env file location:', envPath);
console.log('');
