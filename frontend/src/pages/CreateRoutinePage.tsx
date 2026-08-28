import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, ListOrdered, Minus, Plus, Save, Trash2, X } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import ExerciseFilters from '@/components/exercises/ExerciseFilters';
import ExerciseList from '@/components/exercises/ExerciseList';
import { EXERCISES } from '@/data/exercises';
import { ALL_EQUIPMENT, ALL_MUSCLE_GROUPS, filterExercises, type EquipmentFilter, type MuscleGroupFilter } from '@/utils/exercises';
import { saveCustomRoutine, ApiError } from '@/lib/customRoutines';
import type { Exercise, Routine } from '@/types/workout';

type DraftExercise = { exercise: Exercise; plannedSets: number };

export default function CreateRoutinePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [draft, setDraft] = useState<DraftExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [equipment, setEquipment] = useState<EquipmentFilter>(ALL_EQUIPMENT);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupFilter>(ALL_MUSCLE_GROUPS);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const visibleExercises = filterExercises(EXERCISES, equipment, muscleGroup);
  const draftIds = new Set(draft.map((item) => item.exercise.id));

  function addExercise(exercise: Exercise) {
    if (draftIds.has(exercise.id)) return;
    setDraft((current) => [...current, { exercise, plannedSets: 3 }]);
    setPickerOpen(false);
  }

  function removeExercise(exerciseId: string) {
    setDraft((current) => current.filter((item) => item.exercise.id !== exerciseId));
  }

  function adjustSets(exerciseId: string, delta: number) {
    setDraft((current) =>
      current.map((item) =>
        item.exercise.id === exerciseId
          ? { ...item, plannedSets: Math.max(1, Math.min(10, item.plannedSets + delta)) }
          : item,
      ),
    );
  }

  function moveExercise(index: number, direction: -1 | 1) {
    setDraft((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Give your routine a name.');
      return;
    }
    if (draft.length === 0) {
      setError('Add at least one exercise.');
      return;
    }
    if (saving) return;
    const slug = trimmedName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const routine: Routine = {
      id: `${slug || 'routine'}-${Date.now().toString(36)}`,
      name: trimmedName,
      exercises: draft.map((item) => ({ exerciseId: item.exercise.id, plannedSets: item.plannedSets })),
    };
    setSaving(true);
    setError('');
    try {
      await saveCustomRoutine(routine);
      navigate('/workout');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('saveCustomRoutine failed:', err);
      if (err instanceof ApiError) {
        setError(
          err.code === 'VALIDATION_ERROR'
            ? err.message + (err.details ? ` (${JSON.stringify(err.details)})` : '')
            : err.code === 'CONFLICT'
              ? 'You already have a routine with a conflicting exercise reference.'
              : err.message || 'Could not save this routine. Try again.',
        );
      } else {
        setError('Could not save this routine — check your connection and try again.');
      }
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Create Routine"
        description="Plan the ordered exercises and target sets — reuse it every time you start a workout."
      />
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <button
            type="button"
            onClick={() => navigate('/workout')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-ink-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Log Workout
          </button>

          <div className="card p-5">
            <label htmlFor="routine-name" className="label">Routine name</label>
            <input
              id="routine-name"
              type="text"
              placeholder="e.g. Upper Body Strength"
              value={name}
              onChange={(event) => { setName(event.target.value); setError(''); }}
              className="input"
              autoFocus
            />
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-energy-400">
                  <ListOrdered className="h-4.5 w-4.5" strokeWidth={2} />
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Exercises ({draft.length})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen((current) => !current)}
                className="btn-outline px-3 py-1.5 text-xs"
              >
                {pickerOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {pickerOpen ? 'Close' : 'Add Exercise'}
              </button>
            </div>

            {pickerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.18 }}
                className="mt-4 rounded-xl border border-ink-200 bg-ink-50/40 p-4"
              >
                <ExerciseFilters
                  equipment={equipment}
                  muscleGroup={muscleGroup}
                  onEquipmentChange={setEquipment}
                  onMuscleGroupChange={setMuscleGroup}
                />
                <div className="mt-4">
                  <ExerciseList
                    exercises={visibleExercises}
                    selectedId={null}
                    onSelect={addExercise}
                    variant="compact"
                  />
                </div>
              </motion.div>
            )}

            {draft.length === 0 ? (
              <p className="mt-4 text-sm text-ink-500">No exercises yet — use "Add Exercise" to build the plan.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {draft.map((item, index) => (
                  <div
                    key={item.exercise.id}
                    className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink-100 text-xs font-700 text-ink-700">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{item.exercise.name}</p>
                      <p className="truncate text-xs text-ink-500">{item.exercise.equipment} • {item.exercise.muscleGroup}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveExercise(index, -1)}
                        disabled={index === 0}
                        aria-label="Move up"
                        className="grid h-7 w-7 place-items-center rounded-md text-ink-500 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveExercise(index, 1)}
                        disabled={index === draft.length - 1}
                        aria-label="Move down"
                        className="grid h-7 w-7 place-items-center rounded-md text-ink-500 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-ink-50 px-1.5 py-1">
                      <button
                        type="button"
                        onClick={() => adjustSets(item.exercise.id, -1)}
                        disabled={item.plannedSets <= 1}
                        aria-label="Decrease planned sets"
                        className="grid h-6 w-6 place-items-center rounded-md bg-white text-ink-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-14 text-center text-xs font-semibold text-ink-900">{item.plannedSets} sets</span>
                      <button
                        type="button"
                        onClick={() => adjustSets(item.exercise.id, 1)}
                        disabled={item.plannedSets >= 10}
                        aria-label="Increase planned sets"
                        className="grid h-6 w-6 place-items-center rounded-md bg-white text-ink-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeExercise(item.exercise.id)}
                      aria-label={`Remove ${item.exercise.name}`}
                      className="shrink-0 text-ink-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => navigate('/workout')} className="btn-outline flex-1">
              Cancel
            </button>
            <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={handleSave} disabled={saving} className="btn-accent flex-1">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Routine'}
            </motion.button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
