-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_pendingDeletionBy_fkey" FOREIGN KEY ("pendingDeletionBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
