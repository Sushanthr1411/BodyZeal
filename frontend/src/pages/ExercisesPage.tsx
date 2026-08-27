import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import ExerciseFilters from '@/components/exercises/ExerciseFilters';
import ExerciseLibraryCard from '@/components/exercises/ExerciseLibraryCard';
import { EXERCISES, MUSCLE_GROUP_OPTIONS } from '@/data/exercises';
import { ALL_EQUIPMENT, ALL_MUSCLE_GROUPS, filterExercises, type EquipmentFilter, type MuscleGroupFilter } from '@/utils/exercises';
import { muscleGroupAccent } from '@/utils/muscleGroupColor';
import type { Exercise, MuscleGroup } from '@/types/workout';

export default function ExercisesPage() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<EquipmentFilter>(ALL_EQUIPMENT);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupFilter>(ALL_MUSCLE_GROUPS);

  const visibleExercises = filterExercises(EXERCISES, equipment, muscleGroup);
  const goToDetail = (exercise: Exercise) => navigate(`/exercises/${exercise.id}`);

  // Browsing everything reads better sectioned by muscle group; a specific filter is
  // already a homogeneous result set, so it stays a flat grid.
  const sections: { group: MuscleGroup; exercises: Exercise[] }[] | null =
    muscleGroup === ALL_MUSCLE_GROUPS
      ? MUSCLE_GROUP_OPTIONS.map((group) => ({
          group,
          exercises: visibleExercises.filter((exercise) => exercise.muscleGroup === group),
        })).filter((section) => section.exercises.length > 0)
      : null;

  return (
    <DashboardLayout>
      <PageHeader
        title="Exercises"
        description="Browse the exercise library by equipment and muscle group. Select one to see your history and progress."
      />
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl space-y-5">
          <div className="card relative p-5">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
            </div>
            <ExerciseFilters
              equipment={equipment}
              muscleGroup={muscleGroup}
              onEquipmentChange={setEquipment}
              onMuscleGroupChange={setMuscleGroup}
            />
          </div>

          <p className="px-1 text-xs font-semibold uppercase tracking-wider text-ink-400">
            {visibleExercises.length} {visibleExercises.length === 1 ? 'exercise' : 'exercises'}
          </p>

          {visibleExercises.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={Dumbbell}
                title="No exercises found for this combination."
                description="Try changing the equipment or muscle group."
              />
            </div>
          ) : sections ? (
            <div className="space-y-8">
              {sections.map((section, index) => {
                const accent = muscleGroupAccent(section.group);
                return (
                  <motion.section
                    key={section.group}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="mb-3 flex items-center gap-2 px-1">
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${accent.badge}`}>
                        <Dumbbell className="h-3.5 w-3.5" strokeWidth={2} />
                      </span>
                      <h2 className="text-sm font-semibold text-ink-900">{section.group}</h2>
                      <span className="text-xs text-ink-400">{section.exercises.length}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {section.exercises.map((exercise) => (
                        <ExerciseLibraryCard key={exercise.id} exercise={exercise} onSelect={() => goToDetail(exercise)} />
                      ))}
                    </div>
                  </motion.section>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleExercises.map((exercise) => (
                <ExerciseLibraryCard key={exercise.id} exercise={exercise} onSelect={() => goToDetail(exercise)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
