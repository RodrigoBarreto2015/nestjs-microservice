-- CreateTable
CREATE TABLE "Upstream" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "jwtRequired" BOOLEAN NOT NULL DEFAULT false,
    "jwtIssuer" TEXT,
    "jwtAudiences" TEXT,
    "jwksUrl" TEXT,
    "jwtAlg" TEXT,
    "timeoutMs" INTEGER NOT NULL DEFAULT 8000,
    "cbErrorPct" INTEGER NOT NULL DEFAULT 50,
    "cbResetMs" INTEGER NOT NULL DEFAULT 10000,
    "canaryUrl" TEXT,
    "canaryWeight" INTEGER,
    "shadowUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Upstream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "rewrite" TEXT,
    "upstreamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Upstream_name_key" ON "Upstream"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Route_prefix_key" ON "Route"("prefix");

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_upstreamId_fkey" FOREIGN KEY ("upstreamId") REFERENCES "Upstream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
