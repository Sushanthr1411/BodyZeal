import type { UserProfile, ExperienceLevel, FitnessGoal } from '@/types/profile';
import type { MuscleGroup } from '@/types/workout';
import { EXERCISES, MUSCLE_GROUP_OPTIONS } from '@/data/exercises';
import type { RecentWorkout } from '@/lib/recentWorkouts';
import { muscleGroupVolumeAll } from '@/utils/analytics';

export type RoadmapExercise = {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string;
};

export type RoadmapDay = {
  title: string;
  muscleGroups: MuscleGroup[];
  exercises: RoadmapExercise[];
};

export type RoadmapWeek = {
  weekNumber: number;
  theme: string;
  note: string;
};

export type Roadmap = {
  goalLabel: string;
  levelLabel: string;
  daysPerWeek: number;
  days: RoadmapDay[];
  weeks: RoadmapWeek[];
  focusAreas: MuscleGroup[];
};

const GOAL_LABELS: Record<FitnessGoal, string> = {
  build_muscle: 'Build Muscle',
  lose_weight: 'Lose Weight',
  maintain_fitness: 'Maintain Fitness',
};

const LEVEL_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** A simple, well-established split per experience level — full body for
 * beginners (more recovery time between the same muscle group), a push/pull/legs
 * style split for intermediate/advanced (more frequency and volume per group). */
const SPLITS: Record<ExperienceLevel, { title: string; groups: MuscleGroup[] }[]> = {
  beginner: [
    { title: 'Full Body A', groups: ['Chest', 'Back', 'Legs', 'Shoulders', 'Abs / Core'] },
    { title: 'Full Body B', groups: ['Legs', 'Back', 'Chest', 'Biceps', 'Triceps'] },
    { title: 'Full Body C', groups: ['Shoulders', 'Back', 'Legs', 'Glutes', 'Abs / Core'] },
  ],
  intermediate: [
    { title: 'Push Day', groups: ['Chest', 'Shoulders', 'Triceps'] },
    { title: 'Pull Day', groups: ['Back', 'Biceps', 'Forearms'] },
    { title: 'Leg Day', groups: ['Legs', 'Glutes', 'Calves'] },
    { title: 'Upper Body', groups: ['Chest', 'Back', 'Shoulders', 'Abs / Core'] },
  ],
  advanced: [
    { title: 'Push Day', groups: ['Chest', 'Shoulders', 'Triceps'] },
    { title: 'Pull Day', groups: ['Back', 'Biceps', 'Forearms'] },
    { title: 'Leg Day', groups: ['Legs', 'Glutes', 'Calves'] },
    { title: 'Upper Body II', groups: ['Shoulders', 'Chest', 'Abs / Core'] },
    { title: 'Lower & Glutes', groups: ['Legs', 'Glutes', 'Back'] },
  ],
};

const REP_TARGETS: Record<FitnessGoal, { sets: number; reps: string }> = {
  build_muscle: { sets: 4, reps: '8–12' },
  lose_weight: { sets: 3, reps: '12–15' },
  maintain_fitness: { sets: 3, reps: '10–12' },
};

/** One 4-week mesocycle: the exercises stay the same each week (so progress is
 * easy to compare), only the target effort/volume changes — a standard,
 * beginner-friendly progression model ending in a deload. */
const WEEK_THEMES: { theme: string; note: string }[] = [
  { theme: 'Foundation', note: 'Learn each movement and settle into a rhythm. Focus on clean form, not heavy weight.' },
  { theme: 'Progressive Overload', note: 'Add a little more weight, or an extra rep or two, compared to last week on each exercise.' },
  { theme: 'Peak Volume', note: 'Your hardest week — push the intensity, and add an extra set on your main lifts if you feel strong.' },
  { theme: 'Deload & Recover', note: 'Ease off by about 30–40% effort this week. Let your body recover before the next 4-week block.' },
];

function pickExercisesForGroup(group: MuscleGroup, count: number, used: Set<string>) {
  const all = EXERCISES.filter((exercise) => exercise.muscleGroup === group);
  const fresh = all.filter((exercise) => !used.has(exercise.id));
  // Fall back to reusing an exercise already used elsewhere in the week if the
  // muscle group's pool is too small to stay fully unique across every day.
  const pool = fresh.length >= count ? fresh : all;
  return pool.slice(0, count);
}

/** Builds a 4-week training roadmap from the user's goal/experience level, with
 * extra attention on whichever muscle groups their logged history shows the
 * least volume for. Returns null if the profile hasn't set a goal/level yet. */
export function generateRoadmap(profile: UserProfile, history: RecentWorkout[]): Roadmap | null {
  if (!profile.fitnessGoal || !profile.experienceLevel) return null;

  const goal = profile.fitnessGoal;
  const level = profile.experienceLevel;
  const template = SPLITS[level];
  const repTarget = REP_TARGETS[goal];

  const focusAreas: MuscleGroup[] = history.length
    ? (() => {
        const volumeByGroup = muscleGroupVolumeAll(history);
        return MUSCLE_GROUP_OPTIONS.slice()
          .sort((a, b) => volumeByGroup[a] - volumeByGroup[b])
          .slice(0, 3);
      })()
    : [];

  const used = new Set<string>();
  const days: RoadmapDay[] = template.map((day) => {
    const exercises: RoadmapExercise[] = [];
    for (const group of day.groups) {
      const isFocus = focusAreas.includes(group);
      const picks = pickExercisesForGroup(group, isFocus ? 2 : 1, used);
      for (const pick of picks) {
        used.add(pick.id);
        exercises.push({
          exerciseId: pick.id,
          name: pick.name,
          muscleGroup: pick.muscleGroup,
          sets: repTarget.sets,
          reps: repTarget.reps,
        });
      }
    }
    return { title: day.title, muscleGroups: day.groups, exercises };
  });

  const weeks: RoadmapWeek[] = WEEK_THEMES.map((week, index) => ({
    weekNumber: index + 1,
    theme: week.theme,
    note: week.note,
  }));

  return {
    goalLabel: GOAL_LABELS[goal],
    levelLabel: LEVEL_LABELS[level],
    daysPerWeek: template.length,
    days,
    weeks,
    focusAreas,
  };
}
