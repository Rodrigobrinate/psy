/**
 * Database Seed
 * Popula o banco com testes psicológicos padrão
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ====================================
  // PHQ-9 (Patient Health Questionnaire-9)
  // ====================================

  const phq9 = await prisma.test.upsert({
    where: { code: 'PHQ9' },
    update: {},
    create: {
      code: 'PHQ9',
      name: 'Patient Health Questionnaire-9',
      description:
        'Questionário de rastreio e avaliação da gravidade de sintomas depressivos.',
      category: 'DEPRESSION',
      minScore: 0,
      maxScore: 27,
      hasTimer: false,
      isPublicDomain: true,
      requiresLicense: false,
      scoringRules: {
        ranges: [
          { min: 0, max: 4, level: 'MINIMAL' },
          { min: 5, max: 9, level: 'MILD' },
          { min: 10, max: 14, level: 'MODERATE' },
          { min: 15, max: 19, level: 'MODERATELY_SEVERE' },
          { min: 20, max: 27, level: 'SEVERE' },
        ],
      },
      questions: {
        create: [
          {
            orderIndex: 1,
            questionText:
              'Pouco interesse ou prazer em fazer as coisas',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 2,
            questionText:
              'Sentir-se para baixo, deprimido(a) ou sem esperança',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 3,
            questionText:
              'Dificuldade para pegar no sono, continuar dormindo ou dormir demais',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 4,
            questionText: 'Sentir-se cansado(a) ou com pouca energia',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 5,
            questionText: 'Falta de apetite ou comendo demais',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 6,
            questionText:
              'Sentir-se mal consigo mesmo(a) ou achar que é um fracasso ou que decepcionou sua família',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 7,
            questionText:
              'Dificuldade de concentração (ex: ler jornal ou assistir TV)',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 8,
            questionText:
              'Lentidão para se movimentar ou falar (a ponto de outras pessoas perceberem), ou o oposto: ficar agitado(a) ou inquieto(a)',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 9,
            questionText:
              'Pensar em se ferir de alguma forma ou que seria melhor estar morto(a)',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
        ],
      },
    },
  });

  console.log('✅ PHQ-9 created:', phq9.id);

  // ====================================
  // GAD-7 (Generalized Anxiety Disorder-7)
  // ====================================

  const gad7 = await prisma.test.upsert({
    where: { code: 'GAD7' },
    update: {},
    create: {
      code: 'GAD7',
      name: 'Generalized Anxiety Disorder-7',
      description:
        'Escala de rastreio para transtorno de ansiedade generalizada.',
      category: 'ANXIETY',
      minScore: 0,
      maxScore: 21,
      hasTimer: false,
      isPublicDomain: true,
      requiresLicense: false,
      scoringRules: {
        ranges: [
          { min: 0, max: 4, level: 'MINIMAL' },
          { min: 5, max: 9, level: 'MILD' },
          { min: 10, max: 14, level: 'MODERATE' },
          { min: 15, max: 21, level: 'SEVERE' },
        ],
      },
      questions: {
        create: [
          {
            orderIndex: 1,
            questionText: 'Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 2,
            questionText: 'Não ser capaz de impedir ou controlar preocupações',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 3,
            questionText: 'Preocupar-se muito com diversas coisas',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 4,
            questionText: 'Dificuldade para relaxar',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 5,
            questionText:
              'Ficar tão agitado(a) que se torna difícil permanecer sentado(a)',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 6,
            questionText: 'Ficar facilmente aborrecido(a) ou irritado(a)',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
          {
            orderIndex: 7,
            questionText: 'Sentir medo como se algo horrível fosse acontecer',
            answerOptions: [
              { value: 0, label: 'Nenhuma vez' },
              { value: 1, label: 'Vários dias' },
              { value: 2, label: 'Mais da metade dos dias' },
              { value: 3, label: 'Quase todos os dias' },
            ],
            weight: 1.0,
          },
        ],
      },
    },
  });

  console.log('✅ GAD-7 created:', gad7.id);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
