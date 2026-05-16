import type { DogSex } from './enums.js';

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  birthDate: string;
  sex: DogSex;
  sterilized: boolean;
  weightKg: number | null;
  lofNumber: string | null;
  lomadNumber: string | null;
  chipNumber: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDogInput {
  name: string;
  breed: string;
  birthDate: string;
  sex: DogSex;
  sterilized?: boolean;
  weightKg?: number;
  lofNumber?: string;
  lomadNumber?: string;
  chipNumber?: string;
}
