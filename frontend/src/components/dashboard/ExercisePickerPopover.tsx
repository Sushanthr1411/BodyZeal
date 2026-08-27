import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Dumbbell } from 'lucide-react';
import type { Exercise } from '@/types/workout';
import type { EquipmentFilter, MuscleGroupFilter } from '@/utils/exercises';
import ExerciseFilters from '@/components/exercises/ExerciseFilters';
import ExerciseList from '@/components/exercises/ExerciseList';

type ExercisePickerPopoverProps = {
  exercises: Exercise[];
  selectedExercise: Exercise | null;
  equipment: EquipmentFilter;
  muscleGroup: MuscleGroupFilter;
  onEquipmentChange: (value: EquipmentFilter) => void;
  onMuscleGroupChange: (value: MuscleGroupFilter) => void;
  onSelect: (exercise: Exercise) => void;
};

/**
 * Compact combobox-style exercise selector: the full filter + list UI (reused
 * as-is, same filtering logic) lives in a floating panel that only takes
 * space when open, instead of always occupying the card.
 */
export default function ExercisePickerPopover({
  exercises,
  selectedExercise,
  equipment,
  muscleGroup,
  onEquipmentChange,
  onMuscleGroupChange,
  onSelect,
}: ExercisePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function handleSelect(exercise: Exercise) {
    onSelect(exercise);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
          open ? 'border-ink-900 ring-2 ring-ink-900/10' : 'border-ink-200 hover:border-ink-300'
        } ${selectedExercise ? 'bg-white' : 'bg-ink-50/60'}`}
      >
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${selectedExercise ? 'bg-ink-900 text-energy-400' : 'bg-ink-200/70 text-ink-500'}`}>
          <Dumbbell className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          {selectedExercise ? (
            <>
              <span className="block truncate text-sm font-semibold text-ink-900">{selectedExercise.name}</span>
              <span className="block truncate text-xs text-ink-500">{selectedExercise.equipment} • {selectedExercise.muscleGroup}</span>
            </>
          ) : (
            <>
              <span className="block text-sm font-semibold text-ink-700">Choose an exercise</span>
              <span className="block text-xs text-ink-400">Filter by equipment or muscle group</span>
            </>
          )}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-ink-400">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-30 mt-2 w-full rounded-xl border border-ink-200 bg-white p-4 shadow-lift"
          >
            <ExerciseFilters
              equipment={equipment}
              muscleGroup={muscleGroup}
              onEquipmentChange={onEquipmentChange}
              onMuscleGroupChange={onMuscleGroupChange}
            />
            <div className="mt-3">
              <ExerciseList
                exercises={exercises}
                selectedId={selectedExercise?.id ?? null}
                onSelect={handleSelect}
                variant="compact"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
