-- Add platform, fcmToken fields and make endpoint/p256dh/auth optional
-- to support native FCM/APNs push alongside existing web push (VAPID)

ALTER TABLE "push_subscriptions"
  ADD COLUMN "platform"   TEXT NOT NULL DEFAULT 'web',
  ADD COLUMN "fcm_token"  TEXT;

ALTER TABLE "push_subscriptions"
  ALTER COLUMN "endpoint" DROP NOT NULL,
  ALTER COLUMN "p256dh"   DROP NOT NULL,
  ALTER COLUMN "auth"     DROP NOT NULL;

CREATE UNIQUE INDEX "push_subscriptions_fcm_token_key"
  ON "push_subscriptions"("fcm_token")
  WHERE "fcm_token" IS NOT NULL;
