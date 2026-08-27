import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import ExerciseFilters from '@/components/exercises/ExerciseFilters';
import ExerciseList from '@/components/exercises/ExerciseList';
import { EXERCISES } from '@/data/exercises';
import { ALL_EQUIPMENT, ALL_MUSCLE_GROUPS, filterExercises, type EquipmentFilter, type MuscleGroupFilter } from '@/utils/exercises';

export default function ExercisesPage() {
  const [equipment, setEquipment] = useState<EquipmentFilter>(ALL_EQUIPMENT);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupFilter>(ALL_MUSCLE_GROUPS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleExercises = filterExercises(EXERCISES, equipment, muscleGroup);

  return (
    <DashboardLayout>
      <PageHeader
        title="Exercises"
        description="Browse the exercise library by equipment and muscle group."
      />
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="card p-5">
            <ExerciseFilters
              equipment={equipment}
              muscleGroup={muscleGroup}
              onEquipmentChange={setEquipment}
              onMuscleGroupChange={setMuscleGroup}
            />

            <div className="mt-5">
              <ExerciseList
                exercises={visibleExercises}
                selectedId={selectedId}
                onSelect={(exercise) => setSelectedId((current) => (current === exercise.id ? null : exercise.id))}
                variant="grid"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
