import type { Exercise } from '@/types/workout';

export const COMMON_EXERCISES: Exercise[] = [
  { id: 'squat', name: 'Squat', category: 'Strength' },
  { id: 'bench-press', name: 'Bench Press', category: 'Strength' },
  { id: 'pull-up', name: 'Pull-Up', category: 'Bodyweight' },
  { id: 'run', name: 'Run', category: 'Cardio' },
];

export const FEATURE_LIST = [
  {
    icon: 'Dumbbell',
    title: 'Workout Logging',
    description: 'Record exercise name, sets, repetitions, and weight in seconds.',
  },
  {
    icon: 'History',
    title: 'Workout History',
    description: 'View workouts grouped by date and sorted chronologically.',
  },
  {
    icon: 'Calculator',
    title: 'Volume Calculation',
    description: 'Automatic volume: Sets × Reps × Weight, computed for you.',
  },
  {
    icon: 'ListChecks',
    title: 'Common Exercises',
    description: 'Quickly select Squat, Bench Press, Pull-Up, Run and more.',
  },
  {
    icon: 'Timer',
    title: 'Rest Timer',
    description: 'Manage breaks between sets with a countdown timer.',
  },
  {
    icon: 'CalendarCheck',
    title: 'Daily Summary',
    description: 'See the total number of exercises completed today at a glance.',
  },
] as const;

export const HOW_IT_WORKS = [
  { step: '01', title: 'Log', description: 'Enter your exercise, sets, reps, and weight.' },
  { step: '02', title: 'Track', description: 'Automatically calculate workout volume and organize activity.' },
  { step: '03', title: 'Review', description: 'View your workouts by date and see today\u2019s exercise summary.' },
] as const;
