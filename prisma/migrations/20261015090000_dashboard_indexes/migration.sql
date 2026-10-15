-- Nonunique access-path indexes: no legacy rows or duplicate shares are deleted.
CREATE INDEX "Contract_userId_name_id_idx" ON "Contract"("userId", "name", "id");
CREATE INDEX "Resource_contractId_idx" ON "Resource"("contractId");
CREATE INDEX "Period_contractId_from_idx" ON "Period"("contractId", "from");
CREATE INDEX "Share_toId_id_idx" ON "Share"("toId", "id");
CREATE INDEX "Share_fromId_createdAt_idx" ON "Share"("fromId", "createdAt");
CREATE INDEX "Share_contractId_idx" ON "Share"("contractId");
CREATE INDEX "ProvidersOnContract_contractId_idx" ON "ProvidersOnContract"("contractId");
CREATE INDEX "Notification_userId_date_id_idx" ON "Notification"("userId", "date" DESC, "id" DESC);
