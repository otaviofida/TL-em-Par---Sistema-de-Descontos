-- CreateTable
CREATE TABLE "app_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key")
);

-- Seed default: registrations enabled
INSERT INTO "app_settings" ("key", "value", "updated_at") VALUES ('registrationEnabled', 'true', NOW());
