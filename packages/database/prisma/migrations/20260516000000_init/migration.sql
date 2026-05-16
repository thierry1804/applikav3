warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('owner', 'vet', 'admin');

-- CreateEnum
CREATE TYPE "DogSex" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('vaccine', 'deworming', 'antiparasitic', 'custom');

-- CreateEnum
CREATE TYPE "MedicationDoseStatus" AS ENUM ('taken', 'missed', 'skipped');

-- CreateEnum
CREATE TYPE "HygieneCareType" AS ENUM ('teeth', 'nails', 'bath', 'brushing', 'grooming', 'ears', 'custom');

-- CreateEnum
CREATE TYPE "MealFoodType" AS ENUM ('kibble', 'wet', 'barf', 'mixed');

-- CreateEnum
CREATE TYPE "CheckupRecommendation" AS ENUM ('good', 'watch', 'consult');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'owner',
    "is_breeder" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dogs" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "sex" "DogSex" NOT NULL,
    "sterilized" BOOLEAN NOT NULL DEFAULT false,
    "weight_kg" DECIMAL(5,2),
    "lof_number" TEXT,
    "lomad_number" TEXT,
    "chip_number" TEXT,
    "photo_url" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breeds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breed_weight_ranges" (
    "id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,
    "min_age_months" INTEGER NOT NULL,
    "max_age_months" INTEGER NOT NULL,
    "min_weight_kg" DECIMAL(5,2) NOT NULL,
    "max_weight_kg" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "breed_weight_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_records" (
    "id" TEXT NOT NULL,
    "dog_id" TEXT NOT NULL,
    "vet_name" TEXT NOT NULL,
    "visit_date" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "diagnosis" TEXT,
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "dog_id" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "label" TEXT NOT NULL,
    "due_date" DATE NOT NULL,
    "recurrence_days" INTEGER,
    "last_done_at" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptom_logs" (
    "id" TEXT NOT NULL,
    "dog_id" TEXT NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL,
    "symptoms" JSONB NOT NULL,
    "severity" INTEGER NOT NULL,
    "notes" TEXT,
    "photo_url" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "symptom_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "dog_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" JSONB NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "stock_count" INTEGER,
    "stock_alert_threshold" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_dose_logs" (
    "id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "taken_at" TIMESTAMP(3),
    "status" "MedicationDoseStatus" NOT NULL,
    "idempotency_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_dose_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_logs" (
    "id" TEXT NOT NULL,
    "dog_id" TEXT NOT NULL,
    "weighed_at" DATE NOT NULL,
    "weight_kg" DECIMAL(5,2) NOT NULL,
    "idempotency_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weight_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hygiene_cares" (
    "id" TEXT NOT NULL,
    "dog_id" TEXT NOT NULL,
    "care_type" "HygieneCareType" NOT NULL,
    "label" TEXT,
    "frequency_days" INTEGER NOT NULL,
    "last_done_at" DATE,
    "next_due_at" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hygiene_cares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "dog_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "duration_min" INTEGER NOT NULL,
    "distance_km" DECIMAL(6,2),
    "calories_est" INTEGER,
    "gps_track" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plans" (
    "id" TEXT NOT NULL,
    "dog_id" TEXT NOT NULL,
    "food_type" "MealFoodType" NOT NULL,
    "meals_per_day" INTEGER NOT NULL,
    "grams_per_meal" DECIMAL(6,2) NOT NULL,
    "calories_per_day" INTEGER,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heat_cycles" (
    "id" TEXT NOT NULL,
    "dog_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "duration_days" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heat_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reproductions" (
    "id" TEXT NOT NULL,
    "dog_id" TEXT NOT NULL,
    "heat_cycle_id" TEXT,
    "mating_date" DATE NOT NULL,
    "sire_name" TEXT,
    "sire_chip" TEXT,
    "expected_birth" DATE,
    "actual_birth" DATE,
    "pups_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reproductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkup_questions" (
    "id" TEXT NOT NULL,
    "question_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "min_age_months" INTEGER,
    "max_age_months" INTEGER,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkup_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkup_results" (
    "id" TEXT NOT NULL,
    "dog_id" TEXT NOT NULL,
    "taken_at" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "recommendation" "CheckupRecommendation" NOT NULL,
    "answers" JSONB NOT NULL,
    "saved_to_health_record" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkup_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_vets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_vets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sharing_links" (
    "id" TEXT NOT NULL,
    "dog_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "sections" JSONB NOT NULL,
    "access_count" INTEGER NOT NULL DEFAULT 0,
    "max_accesses" INTEGER NOT NULL DEFAULT 10,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sharing_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sharing_link_accesses" (
    "id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_partial" TEXT NOT NULL,

    CONSTRAINT "sharing_link_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "dog_id" TEXT,
    "group_id" TEXT,
    "content" TEXT NOT NULL,
    "image_urls" JSONB,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("group_id","user_id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "event_date" DATE NOT NULL,
    "location" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "health_record_id" TEXT,
    "symptom_log_id" TEXT,
    "file_key" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "retention_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "key" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "dogs_owner_id_idx" ON "dogs"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "breeds_name_key" ON "breeds"("name");

-- CreateIndex
CREATE INDEX "breed_weight_ranges_breed_id_idx" ON "breed_weight_ranges"("breed_id");

-- CreateIndex
CREATE INDEX "health_records_dog_id_idx" ON "health_records"("dog_id");

-- CreateIndex
CREATE INDEX "health_records_visit_date_idx" ON "health_records"("visit_date");

-- CreateIndex
CREATE INDEX "reminders_dog_id_idx" ON "reminders"("dog_id");

-- CreateIndex
CREATE INDEX "reminders_due_date_idx" ON "reminders"("due_date");

-- CreateIndex
CREATE INDEX "reminders_is_active_idx" ON "reminders"("is_active");

-- CreateIndex
CREATE INDEX "symptom_logs_dog_id_idx" ON "symptom_logs"("dog_id");

-- CreateIndex
CREATE INDEX "symptom_logs_logged_at_idx" ON "symptom_logs"("logged_at");

-- CreateIndex
CREATE INDEX "medications_dog_id_idx" ON "medications"("dog_id");

-- CreateIndex
CREATE INDEX "medications_is_active_idx" ON "medications"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "medication_dose_logs_idempotency_key_key" ON "medication_dose_logs"("idempotency_key");

-- CreateIndex
CREATE INDEX "medication_dose_logs_medication_id_idx" ON "medication_dose_logs"("medication_id");

-- CreateIndex
CREATE INDEX "medication_dose_logs_scheduled_at_idx" ON "medication_dose_logs"("scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "weight_logs_idempotency_key_key" ON "weight_logs"("idempotency_key");

-- CreateIndex
CREATE INDEX "weight_logs_dog_id_idx" ON "weight_logs"("dog_id");

-- CreateIndex
CREATE INDEX "weight_logs_weighed_at_idx" ON "weight_logs"("weighed_at");

-- CreateIndex
CREATE INDEX "hygiene_cares_dog_id_idx" ON "hygiene_cares"("dog_id");

-- CreateIndex
CREATE INDEX "hygiene_cares_next_due_at_idx" ON "hygiene_cares"("next_due_at");

-- CreateIndex
CREATE INDEX "hygiene_cares_is_active_idx" ON "hygiene_cares"("is_active");

-- CreateIndex
CREATE INDEX "activities_dog_id_idx" ON "activities"("dog_id");

-- CreateIndex
CREATE INDEX "activities_started_at_idx" ON "activities"("started_at");

-- CreateIndex
CREATE INDEX "meal_plans_dog_id_idx" ON "meal_plans"("dog_id");

-- CreateIndex
CREATE INDEX "heat_cycles_dog_id_idx" ON "heat_cycles"("dog_id");

-- CreateIndex
CREATE INDEX "reproductions_dog_id_idx" ON "reproductions"("dog_id");

-- CreateIndex
CREATE UNIQUE INDEX "checkup_questions_question_key_key" ON "checkup_questions"("question_key");

-- CreateIndex
CREATE INDEX "checkup_results_dog_id_idx" ON "checkup_results"("dog_id");

-- CreateIndex
CREATE INDEX "favorite_vets_user_id_idx" ON "favorite_vets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_vets_user_id_place_id_key" ON "favorite_vets"("user_id", "place_id");

-- CreateIndex
CREATE UNIQUE INDEX "sharing_links_token_key" ON "sharing_links"("token");

-- CreateIndex
CREATE INDEX "sharing_links_dog_id_idx" ON "sharing_links"("dog_id");

-- CreateIndex
CREATE INDEX "sharing_links_token_idx" ON "sharing_links"("token");

-- CreateIndex
CREATE INDEX "sharing_link_accesses_link_id_idx" ON "sharing_link_accesses"("link_id");

-- CreateIndex
CREATE INDEX "posts_author_id_idx" ON "posts"("author_id");

-- CreateIndex
CREATE INDEX "posts_group_id_idx" ON "posts"("group_id");

-- CreateIndex
CREATE INDEX "events_event_date_idx" ON "events"("event_date");

-- CreateIndex
CREATE INDEX "attachments_health_record_id_idx" ON "attachments"("health_record_id");

-- CreateIndex
CREATE INDEX "attachments_symptom_log_id_idx" ON "attachments"("symptom_log_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_user_id_idx" ON "device_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dogs" ADD CONSTRAINT "dogs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breed_weight_ranges" ADD CONSTRAINT "breed_weight_ranges_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "breeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptom_logs" ADD CONSTRAINT "symptom_logs_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_dose_logs" ADD CONSTRAINT "medication_dose_logs_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_logs" ADD CONSTRAINT "weight_logs_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hygiene_cares" ADD CONSTRAINT "hygiene_cares_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heat_cycles" ADD CONSTRAINT "heat_cycles_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reproductions" ADD CONSTRAINT "reproductions_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reproductions" ADD CONSTRAINT "reproductions_heat_cycle_id_fkey" FOREIGN KEY ("heat_cycle_id") REFERENCES "heat_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkup_results" ADD CONSTRAINT "checkup_results_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_vets" ADD CONSTRAINT "favorite_vets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharing_links" ADD CONSTRAINT "sharing_links_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharing_links" ADD CONSTRAINT "sharing_links_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharing_link_accesses" ADD CONSTRAINT "sharing_link_accesses_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "sharing_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_health_record_id_fkey" FOREIGN KEY ("health_record_id") REFERENCES "health_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_symptom_log_id_fkey" FOREIGN KEY ("symptom_log_id") REFERENCES "symptom_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

