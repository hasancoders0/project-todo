-- CreateTable
CREATE TABLE "TodoStatusHistory" (
    "id" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "fromStatus" "TodoStatus" NOT NULL,
    "toStatus" "TodoStatus" NOT NULL,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TodoStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TodoStatusHistory_todoId_changedAt_idx" ON "TodoStatusHistory"("todoId", "changedAt");

-- CreateIndex
CREATE INDEX "TodoStatusHistory_changedById_changedAt_idx" ON "TodoStatusHistory"("changedById", "changedAt");

-- AddForeignKey
ALTER TABLE "TodoStatusHistory" ADD CONSTRAINT "TodoStatusHistory_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoStatusHistory" ADD CONSTRAINT "TodoStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
