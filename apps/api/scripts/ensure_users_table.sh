#!/bin/sh
# Emergency script to ensure users table exists
# This runs the migration SQL directly if Prisma migrations fail

echo "🔧 Emergency: Ensuring users table exists..."

# Get the script directory (should be in /app/apps/api/scripts)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATION_FILE="$API_DIR/prisma/migrations/1_add_users_tables/migration.sql"

echo "📂 Looking for migration file at: $MIGRATION_FILE"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Migration file not found at: $MIGRATION_FILE"
  echo "📂 Current directory: $(pwd)"
  echo "📂 Listing prisma/migrations:"
  ls -la prisma/migrations/ 2>/dev/null || echo "prisma/migrations/ not found"
  exit 1
fi

# Check if users table exists and create if needed
node -e "
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function ensureUsersTable() {
  try {
    // Check if users table exists
    await prisma.\$queryRaw\`SELECT 1 FROM users LIMIT 1\`;
    console.log('✅ Users table already exists');
    await prisma.\$disconnect();
    process.exit(0);
  } catch (err) {
    if (err.message.includes('does not exist') || err.message.includes('relation')) {
      console.log('❌ Users table does not exist - creating it...');
      try {
        // Read and execute the migration SQL
        const migrationPath = process.argv[1];
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('📝 Executing migration SQL...');
        // Execute the SQL (split by semicolons and execute each statement)
        const statements = sql.split(';').filter(s => s.trim().length > 0);
        for (const statement of statements) {
          const trimmed = statement.trim();
          if (trimmed && !trimmed.startsWith('--')) {
            try {
              await prisma.\$executeRawUnsafe(trimmed);
            } catch (stmtErr) {
              // Ignore errors for IF NOT EXISTS statements
              if (!stmtErr.message.includes('already exists') && 
                  !stmtErr.message.includes('duplicate')) {
                console.warn('⚠️  Statement warning:', stmtErr.message);
              }
            }
          }
        }
        console.log('✅ Users table created successfully!');
        await prisma.\$disconnect();
        process.exit(0);
      } catch (createErr) {
        console.error('❌ Failed to create users table:', createErr.message);
        await prisma.\$disconnect();
        process.exit(1);
      }
    } else {
      console.error('❌ Error checking users table:', err.message);
      await prisma.\$disconnect();
      process.exit(1);
    }
  }
}

ensureUsersTable();
" "$MIGRATION_FILE" 2>&1

