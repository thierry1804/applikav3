import type {
  CheckupRecommendation,
  HygieneCareType,
  MedicationDoseStatus,
  ReminderType,
} from './enums.js';

export interface HealthRecord {
  id: string;
  dogId: string;
  vetName: string;
  visitDate: string;
  reason: string;
  diagnosis: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  dogId: string;
  type: ReminderType;
  label: string;
  dueDate: string;
  recurrenceDays: number | null;
  lastDoneAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomLog {
  id: string;
  dogId: string;
  loggedAt: string;
  symptoms: string[];
  severity: number;
  notes: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  dogId: string;
  name: string;
  dosage: string;
  frequency: Record<string, unknown>;
  startDate: string;
  endDate: string | null;
  stockCount: number | null;
  stockAlertThreshold: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationDoseLog {
  id: string;
  medicationId: string;
  scheduledAt: string;
  takenAt: string | null;
  status: MedicationDoseStatus;
}

export interface WeightLog {
  id: string;
  dogId: string;
  weighedAt: string;
  weightKg: number;
  createdAt: string;
}

export interface HygieneCare {
  id: string;
  dogId: string;
  careType: HygieneCareType;
  label: string | null;
  frequencyDays: number;
  lastDoneAt: string | null;
  nextDueAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CheckupResult {
  id: string;
  dogId: string;
  takenAt: string;
  score: number;
  recommendation: CheckupRecommendation;
  answers: Record<string, unknown>;
  savedToHealthRecord: boolean;
  createdAt: string;
}

export interface Attachment {
  id: string;
  healthRecordId: string | null;
  symptomLogId: string | null;
  fileKey: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}
