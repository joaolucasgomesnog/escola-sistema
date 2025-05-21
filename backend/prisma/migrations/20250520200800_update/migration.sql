-- CreateTable
CREATE TABLE "BlackListToken" (
    "token" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BlackListToken_token_key" ON "BlackListToken"("token");
