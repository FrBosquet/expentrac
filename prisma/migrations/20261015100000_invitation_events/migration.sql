CREATE TABLE "InvitationEvent" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  CONSTRAINT "InvitationEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "InvitationEvent_userId_createdAt_idx" ON "InvitationEvent"("userId", "createdAt");
ALTER TABLE "InvitationEvent" ADD CONSTRAINT "InvitationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Preserve existing recent activity at rollout; pruning old shares cannot reset the new counter.
INSERT INTO "InvitationEvent" ("id", "createdAt", "userId")
SELECT 'existing/' || "id", "createdAt", "fromId" FROM "Share" WHERE "createdAt" >= CURRENT_TIMESTAMP - INTERVAL '1 hour';
