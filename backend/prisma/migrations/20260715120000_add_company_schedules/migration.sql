-- CreateTable
CREATE TABLE "company_schedules" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,

    CONSTRAINT "company_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_schedules_company_id_day_of_week_key" ON "company_schedules"("company_id", "day_of_week");

-- AddForeignKey
ALTER TABLE "company_schedules" ADD CONSTRAINT "company_schedules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
