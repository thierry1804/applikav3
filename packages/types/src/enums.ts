export enum UserRole {
  OWNER = 'owner',
  VET = 'vet',
  ADMIN = 'admin',
}

export enum DogSex {
  MALE = 'male',
  FEMALE = 'female',
}

export enum ReminderType {
  VACCINE = 'vaccine',
  DEWORMING = 'deworming',
  ANTIPARASITIC = 'antiparasitic',
  CUSTOM = 'custom',
}

export enum MedicationDoseStatus {
  TAKEN = 'taken',
  MISSED = 'missed',
  SKIPPED = 'skipped',
}

export enum HygieneCareType {
  TEETH = 'teeth',
  NAILS = 'nails',
  BATH = 'bath',
  BRUSHING = 'brushing',
  GROOMING = 'grooming',
  EARS = 'ears',
  CUSTOM = 'custom',
}

export enum MealFoodType {
  KIBBLE = 'kibble',
  WET = 'wet',
  BARF = 'barf',
  MIXED = 'mixed',
}

export enum CheckupRecommendation {
  GOOD = 'good',
  WATCH = 'watch',
  CONSULT = 'consult',
}
