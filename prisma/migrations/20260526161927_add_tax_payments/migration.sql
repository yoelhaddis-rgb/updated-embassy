-- CreateTable
CREATE TABLE "TaxPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amountPaid" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentGroupId" TEXT,
    "registeredByName" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaxPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxPayment_userId_year_key" ON "TaxPayment"("userId", "year");
