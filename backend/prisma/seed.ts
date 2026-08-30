import { PrismaClient, Equipment, MuscleGroup } from '@prisma/client';
import { EXERCISES } from './seedData/exercises';
import { ROUTINES } from './seedData/routines';

const prisma = new PrismaClient();

// Frontend string literals -> Prisma enum values. Exhaustive: if the
// frontend ever adds an equipment/muscle group not listed here, this throws
// at seed time instead of silently inserting a wrong value.
const EQUIPMENT_MAP: Record<string, Equipment> = {
  Dumbbell: Equipment.DUMBBELL,
  Kettlebell: Equipment.KETTLEBELL,
  'Barbell / Rod': Equipment.BARBELL_ROD,
  'Resistance Band': Equipment.RESISTANCE_BAND,
  'Cable Machine': Equipment.CABLE_MACHINE,
  Machine: Equipment.MACHINE,
  Bodyweight: Equipment.BODYWEIGHT,
};

const MUSCLE_GROUP_MAP: Record<string, MuscleGroup> = {
  Chest: MuscleGroup.CHEST,
  Back: MuscleGroup.BACK,
  Shoulders: MuscleGroup.SHOULDERS,
  Biceps: MuscleGroup.BICEPS,
  Triceps: MuscleGroup.TRICEPS,
  Forearms: MuscleGroup.FOREARMS,
  Legs: MuscleGroup.LEGS,
  Glutes: MuscleGroup.GLUTES,
  'Abs / Core': MuscleGroup.ABS_CORE,
  Calves: MuscleGroup.CALVES,
};

function mapEquipment(value: string): Equipment {
  const mapped = EQUIPMENT_MAP[value];
  if (!mapped) throw new Error(`Unmapped equipment value from frontend data: "${value}"`);
  return mapped;
}

function mapMuscleGroup(value: string): MuscleGroup {
  const mapped = MUSCLE_GROUP_MAP[value];
  if (!mapped) throw new Error(`Unmapped muscle group value from frontend data: "${value}"`);
  return mapped;
}

async function seedExercises() {
  for (const exercise of EXERCISES) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      create: {
        id: exercise.id,
        name: exercise.name,
        equipment: mapEquipment(exercise.equipment),
        muscleGroup: mapMuscleGroup(exercise.muscleGroup),
      },
      update: {
        name: exercise.name,
        equipment: mapEquipment(exercise.equipment),
        muscleGroup: mapMuscleGroup(exercise.muscleGroup),
      },
    });
  }
  console.log(`Seeded ${EXERCISES.length} exercises.`);
}

async function seedRoutines() {
  for (const routine of ROUTINES) {
    // Routine itself is upserted by its stable slug id (safe to repeat).
    await prisma.routine.upsert({
      where: { id: routine.id },
      create: { id: routine.id, name: routine.name, userId: null, isSystemDefault: true },
      update: { name: routine.name, isSystemDefault: true },
    });

    // RoutineExercise rows have no natural unique key of their own (a
    // routine can't have the same exercise twice, but the schema doesn't
    // enforce that), so idempotency is done by replacing the full child
    // set inside a transaction rather than upserting each row individually.
    await prisma.$transaction([
      prisma.routineExercise.deleteMany({ where: { routineId: routine.id } }),
      prisma.routineExercise.createMany({
        data: routine.exercises.map((entry, index) => ({
          routineId: routine.id,
          exerciseId: entry.exerciseId,
          plannedSets: entry.plannedSets,
          orderIndex: index,
        })),
      }),
    ]);
  }
  console.log(`Seeded ${ROUTINES.length} default routines.`);
}

async function main() {
  await seedExercises();
  await seedRoutines();
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
