#!/bin/sh
# Emergency script to ensure users table exists
# This runs the migration SQL directly if Prisma migrations fail

echo "🔧 Emergency: Ensuring users table exists..."

# Check if users table exists
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1 FROM users LIMIT 1\`
  .then(() => {
    console.log('✅ Users table already exists');
    process.exit(0);
  })
  .catch(async (err) => {
    if (err.message.includes('does not exist') || err.message.includes('relation')) {
      console.log('❌ Users table does not exist - creating it...');
      try {
        // Read and execute the migration SQL
        const fs = require('fs');
        const path = require('path');
        const sql = fs.readFileSync(
          path.join(__dirname, '../prisma/migrations/1_add_users_tables/migration.sql'),
          'utf8'
        );
        // Execute the SQL
        await prisma.\$executeRawUnsafe(sql);
        console.log('✅ Users table created successfully!');
        process.exit(0);
      } catch (createErr) {
        console.error('❌ Failed to create users table:', createErr.message);
        process.exit(1);
      }
    } else {
      console.error('❌ Error checking users table:', err.message);
      process.exit(1);
    }
  })
  .finally(() => prisma.\$disconnect());
" 2>&1

