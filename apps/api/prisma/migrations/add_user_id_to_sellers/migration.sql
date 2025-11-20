-- AlterTable: Add userId column to sellers table
ALTER TABLE "sellers" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- CreateIndex: Add index for userId
CREATE INDEX IF NOT EXISTS "sellers_userId_idx" ON "sellers"("userId");

-- AddForeignKey: Link sellers to users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sellers_userId_fkey'
    ) THEN
        ALTER TABLE "sellers" 
        ADD CONSTRAINT "sellers_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "users"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;
