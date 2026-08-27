import { X } from 'lucide-react';
import { EQUIPMENT_OPTIONS, MUSCLE_GROUP_OPTIONS } from '@/data/exercises';
import { ALL_EQUIPMENT, ALL_MUSCLE_GROUPS, type EquipmentFilter, type MuscleGroupFilter } from '@/utils/exercises';
import Dropdown from '@/components/common/Dropdown';

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
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Dropdown
          label="Equipment"
          value={equipment}
          onChange={onEquipmentChange}
          accentClassName="text-sky-500"
          options={[{ value: ALL_EQUIPMENT, label: ALL_EQUIPMENT }, ...EQUIPMENT_OPTIONS.map((o) => ({ value: o, label: o }))]}
        />
        <Dropdown
          label="Muscle Group"
          value={muscleGroup}
          onChange={onMuscleGroupChange}
          accentClassName="text-coral-500"
          options={[{ value: ALL_MUSCLE_GROUPS, label: ALL_MUSCLE_GROUPS }, ...MUSCLE_GROUP_OPTIONS.map((o) => ({ value: o, label: o }))]}
        />
      </div>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-900"
        >
          <X className="h-3 w-3" />
          Clear filters
        </button>
      )}
    </div>
  );
}
