import { ChevronDown, X } from 'lucide-react';
import { EQUIPMENT_OPTIONS, MUSCLE_GROUP_OPTIONS } from '@/data/exercises';
import { ALL_EQUIPMENT, ALL_MUSCLE_GROUPS, type EquipmentFilter, type MuscleGroupFilter } from '@/utils/exercises';

type ExerciseFiltersProps = {
  equipment: EquipmentFilter;
  muscleGroup: MuscleGroupFilter;
  onEquipmentChange: (value: EquipmentFilter) => void;
  onMuscleGroupChange: (value: MuscleGroupFilter) => void;
};

export default function ExerciseFilters({
  equipment,
  muscleGroup,
  onEquipmentChange,
  onMuscleGroupChange,
}: ExerciseFiltersProps) {
  const hasActiveFilters = equipment !== ALL_EQUIPMENT || muscleGroup !== ALL_MUSCLE_GROUPS;

  function clearFilters() {
    onEquipmentChange(ALL_EQUIPMENT);
    onMuscleGroupChange(ALL_MUSCLE_GROUPS);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor="equipment-filter" className="label">Equipment</label>
        <div className="relative">
          <select
            id="equipment-filter"
            value={equipment}
            onChange={(event) => onEquipmentChange(event.target.value as EquipmentFilter)}
            className="input appearance-none pr-10"
          >
            <option value={ALL_EQUIPMENT}>{ALL_EQUIPMENT}</option>
            {EQUIPMENT_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="muscle-group-filter" className="label">Muscle Group</label>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-900"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>
        <div className="relative">
          <select
            id="muscle-group-filter"
            value={muscleGroup}
            onChange={(event) => onMuscleGroupChange(event.target.value as MuscleGroupFilter)}
            className="input appearance-none pr-10"
          >
            <option value={ALL_MUSCLE_GROUPS}>{ALL_MUSCLE_GROUPS}</option>
            {MUSCLE_GROUP_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>
      </div>
    </div>
  );
}
