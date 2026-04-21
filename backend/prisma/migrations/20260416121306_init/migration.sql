-- CreateTable
CREATE TABLE "Champion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "traits" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Comp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CompChampion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "compId" INTEGER NOT NULL,
    "championId" INTEGER NOT NULL,
    "isMainCarry" BOOLEAN NOT NULL DEFAULT false,
    "itemNotes" TEXT,
    CONSTRAINT "CompChampion_compId_fkey" FOREIGN KEY ("compId") REFERENCES "Comp" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompChampion_championId_fkey" FOREIGN KEY ("championId") REFERENCES "Champion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CompChampion_compId_championId_key" ON "CompChampion"("compId", "championId");
