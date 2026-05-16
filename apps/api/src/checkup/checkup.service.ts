import { Injectable } from '@nestjs/common';
import { CheckupRecommendation } from '@dogapp/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckupService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuestions(dogId: string): Promise<{ data: unknown[] }> {
    const dog = await this.prisma.dog.findUnique({ where: { id: dogId } });
    const ageMonths = dog ? (new Date().getFullYear() - dog.birthDate.getFullYear()) * 12 : 0;

    const questions = await this.prisma.checkupQuestion.findMany({
      where: {
        OR: [
          { minAgeMonths: null, maxAgeMonths: null },
          {
            minAgeMonths: { lte: ageMonths },
            maxAgeMonths: { gte: ageMonths },
          },
          {
            minAgeMonths: { lte: ageMonths },
            maxAgeMonths: null,
          },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });

    return { data: questions };
  }

  async submit(
    dogId: string,
    answers: Record<string, boolean>,
  ): Promise<{ data: { score: number; recommendation: CheckupRecommendation } }> {
    const values = Object.values(answers);
    const positiveCount = values.filter(Boolean).length;
    const score = values.length > 0 ? Math.round((positiveCount / values.length) * 100) : 0;

    let recommendation: CheckupRecommendation = CheckupRecommendation.GOOD;
    if (score < 50) {
      recommendation = CheckupRecommendation.CONSULT;
    } else if (score < 75) {
      recommendation = CheckupRecommendation.WATCH;
    }

    await this.prisma.checkupResult.create({
      data: {
        dog: { connect: { id: dogId } },
        takenAt: new Date(),
        score,
        recommendation,
        answers,
      },
    });

    return { data: { score, recommendation } };
  }
}
