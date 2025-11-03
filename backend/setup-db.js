// Simple setup script без Prisma
const fs = require('fs');

console.log('✅ Database setup script');
console.log('📝 Note: Run `docker-compose up -d` to start PostgreSQL');
console.log('📝 Note: Then run migrations manually if needed');

// Для production используйте `npx prisma migrate deploy`
process.exit(0);
