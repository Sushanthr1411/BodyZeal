import type { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import {
  getSummary,
  getVolumeByDay,
  getMuscleGroupSplit,
  getFrequency,
  getCurrentStreak,
  getHistoryByDate,
  getLoggedExercises,
  getExerciseProgress,
  getExerciseStats,
} from '../services/analytics.service';

function uid(req: Request): string {
  if (!req.user) throw AppError.unauthorized();
  return req.user.uid;
}

export async function getSummaryController(req: Request, res: Response) {
  res.status(200).json(await getSummary(uid(req)));
}

export async function getVolumeByDayController(req: Request, res: Response) {
  const { days } = req.query as unknown as { days: number };
  res.status(200).json(await getVolumeByDay(uid(req), days));
}

export async function getMuscleGroupSplitController(req: Request, res: Response) {
  const { days } = req.query as unknown as { days?: number };
  res.status(200).json(await getMuscleGroupSplit(uid(req), days));
}

export async function getFrequencyController(req: Request, res: Response) {
  const { weeks } = req.query as unknown as { weeks: number };
  res.status(200).json(await getFrequency(uid(req), weeks));
}

export async function getStreakController(req: Request, res: Response) {
  res.status(200).json({ currentStreak: await getCurrentStreak(uid(req)) });
}

export async function getHistoryByDateController(req: Request, res: Response) {
  res.status(200).json(await getHistoryByDate(uid(req)));
}

export async function getLoggedExercisesController(req: Request, res: Response) {
  res.status(200).json(await getLoggedExercises(uid(req)));
}

export async function getExerciseProgressController(req: Request, res: Response) {
  const exerciseId = req.params.exerciseId as string;
  const { range } = req.query as unknown as { range: '7d' | '30d' | '3m' | 'all' };
  res.status(200).json(await getExerciseProgress(uid(req), exerciseId, range));
}

export async function getExerciseStatsController(req: Request, res: Response) {
  const exerciseId = req.params.exerciseId as string;
  res.status(200).json(await getExerciseStats(uid(req), exerciseId));
}
