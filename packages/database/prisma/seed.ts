import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BREEDS = [
  {
    name: 'Labrador Retriever',
    ranges: [
      { minAge: 0, maxAge: 6, min: 3, max: 12 },
      { minAge: 7, maxAge: 120, min: 25, max: 36 },
    ],
  },
  {
    name: 'Golden Retriever',
    ranges: [
      { minAge: 0, maxAge: 6, min: 3, max: 12 },
      { minAge: 7, maxAge: 120, min: 25, max: 34 },
    ],
  },
  {
    name: 'Berger Allemand',
    ranges: [
      { minAge: 0, maxAge: 6, min: 4, max: 14 },
      { minAge: 7, maxAge: 120, min: 22, max: 40 },
    ],
  },
  { name: 'Caniche', ranges: [{ minAge: 0, maxAge: 120, min: 3, max: 8 }] },
  { name: 'Bouledogue Français', ranges: [{ minAge: 0, maxAge: 120, min: 8, max: 14 }] },
  { name: 'Croisé', ranges: [{ minAge: 0, maxAge: 120, min: 2, max: 40 }] },
];

const CHECKUP_QUESTIONS = [
  { key: 'appetite', label: "L'appétit est-il normal ?", minAge: null, maxAge: null, sort: 1 },
  {
    key: 'energy',
    label: "Le niveau d'énergie est-il habituel ?",
    minAge: null,
    maxAge: null,
    sort: 2,
  },
  { key: 'stool', label: 'Les selles sont-elles normales ?', minAge: null, maxAge: null, sort: 3 },
  { key: 'coat', label: 'Le pelage est-il en bon état ?', minAge: null, maxAge: null, sort: 4 },
  {
    key: 'puppy_vaccines',
    label: 'Les vaccins du chiot sont-ils à jour ?',
    minAge: 0,
    maxAge: 12,
    sort: 5,
  },
  {
    key: 'senior_mobility',
    label: 'Des difficultés de mobilité sont-elles observées ?',
    minAge: 84,
    maxAge: null,
    sort: 6,
  },
];

async function main(): Promise<void> {
  for (const breed of BREEDS) {
    const created = await prisma.breed.upsert({
      where: { name: breed.name },
      update: {},
      create: { name: breed.name },
    });
    for (const range of breed.ranges) {
      await prisma.breedWeightRange.create({
        data: {
          breedId: created.id,
          minAgeMonths: range.minAge,
          maxAgeMonths: range.maxAge,
          minWeightKg: range.min,
          maxWeightKg: range.max,
        },
      });
    }
  }

  const flags = [
    { key: 'pedigree', description: 'F09 Pedigree LOF/LOMAD' },
    { key: 'reproduction', description: 'F11 Reproduction et chaleurs' },
    { key: 'social', description: 'F14 Réseau social' },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: { key: flag.key, isEnabled: false, description: flag.description },
    });
  }

  for (const q of CHECKUP_QUESTIONS) {
    await prisma.checkupQuestion.upsert({
      where: { questionKey: q.key },
      update: {},
      create: {
        questionKey: q.key,
        label: q.label,
        minAgeMonths: q.minAge,
        maxAgeMonths: q.maxAge,
        sortOrder: q.sort,
      },
    });
  }

  console.log('Seed completed');
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
