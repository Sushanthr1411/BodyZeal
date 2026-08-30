import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { startTestServer, stopTestServer, installFakeVerifyIdToken, testAuthHeader } from './helpers/testServer';
import { prisma } from '../src/config/prisma';

let server: Server;
let baseUrl: string;
let restoreVerify: () => void;

const STAMP = Date.now();
const UID_A = `test-analytics-a-${STAMP}`;
const UID_B = `test-analytics-b-${STAMP}`;
const DAY_MS = 24 * 60 * 60 * 1000;

function jsonHeaders(uid: string) {
  return { ...testAuthHeader(uid), 'Content-Type': 'application/json' };
}

async function finishedWorkoutAs(
  uid: string,
  name: string,
  sets: { exerciseId: string; sets: number; reps: number; weight: number }[],
) {
  const startRes = await fetch(`${baseUrl}/api/sessions`, { method: 'POST', headers: jsonHeaders(uid), body: JSON.stringify({ name }) });
  const session = (await startRes.json()) as any;
  for (const s of sets) {
    await fetch(`${baseUrl}/api/sessions/${session.id}/sets`, { method: 'POST', headers: jsonHeaders(uid), body: JSON.stringify(s) });
  }
  const finishRes = await fetch(`${baseUrl}/api/sessions/${session.id}/finish`, { method: 'POST', headers: testAuthHeader(uid) });
  return (await finishRes.json()) as any;
}

/** The API never lets a client set finishedAt — backdating directly via
 * Prisma is the only way to build fixtures for date-range/streak tests. */
async function backdate(sessionId: string, daysAgo: number) {
  const finishedAt = new Date(Date.now() - daysAgo * DAY_MS);
  await prisma.workoutSession.update({ where: { id: sessionId }, data: { finishedAt } });
}

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  restoreVerify = installFakeVerifyIdToken();
});

after(async () => {
  restoreVerify();
  await prisma.user.deleteMany({ where: { id: { in: [UID_A, UID_B] } } }); // cascades sessions + sets
  await prisma.$disconnect();
  await stopTestServer(server);
});

beforeEach(async () => {
  await prisma.workoutSession.deleteMany({ where: { userId: { in: [UID_A, UID_B] } } });
});

// ---- Auth ----

const AUTH_ROUTES: [string, string][] = [
  ['GET', '/api/analytics/summary'],
  ['GET', '/api/analytics/volume-by-day'],
  ['GET', '/api/analytics/muscle-group-split'],
  ['GET', '/api/analytics/frequency'],
  ['GET', '/api/analytics/streak'],
  ['GET', '/api/analytics/history-by-date'],
  ['GET', '/api/analytics/exercises/logged'],
  ['GET', '/api/analytics/exercises/plank/progress'],
  ['GET', '/api/analytics/exercises/plank/stats'],
];

for (const [method, path] of AUTH_ROUTES) {
  test(`${method} ${path} without a token returns 401`, async () => {
    const res = await fetch(`${baseUrl}${path}`, { method });
    assert.equal(res.status, 401);
  });
}

// ---- Empty state (brand-new user, no finished workouts) ----

test('GET /api/analytics/summary is all-zero for a user with no history', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/summary`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { totalWorkouts: 0, totalVolume: 0, totalSets: 0, currentStreak: 0 });
});

test('GET /api/analytics/volume-by-day is zero-filled, oldest-first, for a user with no history', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/volume-by-day?days=7`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any[];
  assert.equal(body.length, 7);
  assert.ok(body.every((d) => d.volume === 0));
  const todayKey = new Date().toISOString().slice(0, 10);
  assert.equal(body[6].dateKey, todayKey, 'the last bucket must be today');
});

test('GET /api/analytics/muscle-group-split is an empty array for a user with no history', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/muscle-group-split`, { headers: testAuthHeader(UID_A) });
  assert.deepEqual(await res.json(), []);
});

test('GET /api/analytics/frequency is zero-filled for a user with no history', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/frequency?weeks=1`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any[];
  assert.equal(body.length, 7);
  assert.ok(body.every((d) => d.count === 0));
});

test('GET /api/analytics/streak is 0 for a user with no history', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/streak`, { headers: testAuthHeader(UID_A) });
  assert.deepEqual(await res.json(), { currentStreak: 0 });
});

test('GET /api/analytics/history-by-date is an empty array for a user with no history', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/history-by-date`, { headers: testAuthHeader(UID_A) });
  assert.deepEqual(await res.json(), []);
});

test('GET /api/analytics/exercises/logged is an empty array for a user with no history', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/exercises/logged`, { headers: testAuthHeader(UID_A) });
  assert.deepEqual(await res.json(), []);
});

test('GET /api/analytics/exercises/:id/progress is an empty array for an exercise never logged', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/exercises/plank/progress`, { headers: testAuthHeader(UID_A) });
  assert.deepEqual(await res.json(), []);
});

test('GET /api/analytics/exercises/:id/stats is null for an exercise never logged', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/exercises/plank/stats`, { headers: testAuthHeader(UID_A) });
  assert.equal(await res.json(), null);
});

// ---- Invalid parameters ----

test('GET /api/analytics/volume-by-day?days=0 is rejected', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/volume-by-day?days=0`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 400);
});

test('GET /api/analytics/volume-by-day?days=91 is rejected', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/volume-by-day?days=91`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 400);
});

test('GET /api/analytics/frequency?weeks=0 is rejected', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/frequency?weeks=0`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 400);
});

test('GET /api/analytics/exercises/:id/progress?range=bogus is rejected', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/exercises/plank/progress?range=bogus`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 400);
});

test('GET /api/analytics/exercises/:id/progress for an unknown exerciseId returns 404', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/exercises/not-a-real-exercise/progress`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 404);
});

test('GET /api/analytics/exercises/:id/stats for an unknown exerciseId returns 404', async () => {
  const res = await fetch(`${baseUrl}/api/analytics/exercises/not-a-real-exercise/stats`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 404);
});

// ---- Normal data & aggregation correctness ----

test('summary aggregates totalWorkouts/totalVolume/totalSets correctly across finished workouts', async () => {
  await finishedWorkoutAs(UID_A, 'Push', [{ exerciseId: 'barbell-bench-press', sets: 3, reps: 8, weight: 60 }]); // 1440
  await finishedWorkoutAs(UID_A, 'Pull', [
    { exerciseId: 'pull-up', sets: 3, reps: 5, weight: 1 }, // 15
    { exerciseId: 'barbell-bent-over-row', sets: 3, reps: 8, weight: 40 }, // 960
  ]);
  const res = await fetch(`${baseUrl}/api/analytics/summary`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any;
  assert.equal(body.totalWorkouts, 2);
  assert.equal(body.totalSets, 3, 'totalSets counts logged rows, not the sets-per-row count');
  assert.equal(body.totalVolume, 1440 + 15 + 960);
  assert.equal(body.currentStreak, 1);
});

test("volume-by-day's today bucket reflects today's finished volume", async () => {
  await finishedWorkoutAs(UID_A, 'Today Session', [{ exerciseId: 'plank', sets: 2, reps: 1, weight: 5 }]); // 10
  const res = await fetch(`${baseUrl}/api/analytics/volume-by-day?days=7`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any[];
  assert.equal(body[6]!.volume, 10);
  assert.equal(body.slice(0, 6).reduce((s, d) => s + d.volume, 0), 0);
});

test('muscle-group-split sums volume per muscle group with correct percentages', async () => {
  await finishedWorkoutAs(UID_A, 'Mixed', [
    { exerciseId: 'barbell-bench-press', sets: 3, reps: 8, weight: 60 }, // Chest, 1440
    { exerciseId: 'pull-up', sets: 3, reps: 5, weight: 4 }, // Back, 60
  ]);
  const res = await fetch(`${baseUrl}/api/analytics/muscle-group-split`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any[];
  const chest = body.find((s) => s.muscleGroup === 'Chest');
  const back = body.find((s) => s.muscleGroup === 'Back');
  assert.equal(chest.volume, 1440);
  assert.equal(back.volume, 60);
  assert.equal(chest.percent + back.percent, 100);
});

test("frequency's today bucket has count 1 and the correct dayOfWeek", async () => {
  await finishedWorkoutAs(UID_A, 'Freq Check', []);
  const res = await fetch(`${baseUrl}/api/analytics/frequency?weeks=1`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any[];
  const today = body[6]!;
  assert.equal(today.count, 1);
  assert.equal(today.dayOfWeek, new Date().getDay());
});

test('history-by-date groups today\'s workouts under "Today" with a correct totalVolume', async () => {
  await finishedWorkoutAs(UID_A, 'Group A', [{ exerciseId: 'plank', sets: 1, reps: 1, weight: 10 }]);
  await finishedWorkoutAs(UID_A, 'Group B', [{ exerciseId: 'plank', sets: 1, reps: 1, weight: 20 }]);
  const res = await fetch(`${baseUrl}/api/analytics/history-by-date`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any[];
  assert.equal(body.length, 1);
  assert.equal(body[0].label, 'Today');
  assert.equal(body[0].workouts.length, 2);
  assert.equal(body[0].totalVolume, 30);
});

test('exercises/logged orders by how often each exercise was logged', async () => {
  await finishedWorkoutAs(UID_A, 'A', [{ exerciseId: 'plank', sets: 1, reps: 1, weight: 1 }]);
  await finishedWorkoutAs(UID_A, 'B', [{ exerciseId: 'plank', sets: 1, reps: 1, weight: 1 }]);
  await finishedWorkoutAs(UID_A, 'C', [{ exerciseId: 'pull-up', sets: 1, reps: 1, weight: 1 }]);
  const res = await fetch(`${baseUrl}/api/analytics/exercises/logged`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any[];
  assert.equal(body[0].id, 'plank', 'logged twice, must rank above pull-up (logged once)');
  assert.ok(body.some((e) => e.id === 'pull-up'));
});

test('exercise progress returns one point per session with correct topWeight/volume/setCount/topReps', async () => {
  await finishedWorkoutAs(UID_A, 'Session 1', [{ exerciseId: 'barbell-bench-press', sets: 3, reps: 8, weight: 60 }]);
  await finishedWorkoutAs(UID_A, 'Session 2', [{ exerciseId: 'barbell-bench-press', sets: 4, reps: 6, weight: 65 }]);
  const res = await fetch(`${baseUrl}/api/analytics/exercises/barbell-bench-press/progress?range=all`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any[];
  assert.equal(body.length, 2);
  assert.equal(body[0].topWeight, 60);
  assert.equal(body[0].volume, 1440);
  assert.equal(body[0].setCount, 1);
  assert.equal(body[0].topReps, 8);
  assert.equal(body[1].topWeight, 65);
  assert.equal(body[1].volume, 1560);
});

test('exercise stats computes bestWeight/bestReps/bestSetVolume/totalVolume/PR correctly across sessions', async () => {
  await finishedWorkoutAs(UID_A, 'S1', [{ exerciseId: 'barbell-bench-press', sets: 3, reps: 10, weight: 50 }]); // vol 1500
  await finishedWorkoutAs(UID_A, 'S2', [{ exerciseId: 'barbell-bench-press', sets: 2, reps: 5, weight: 80 }]); // vol 800
  const res = await fetch(`${baseUrl}/api/analytics/exercises/barbell-bench-press/stats`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any;
  assert.equal(body.timesPerformed, 2);
  assert.equal(body.bestWeight, 80);
  assert.equal(body.bestReps, 10);
  assert.equal(body.bestSetVolume, 1500, 'the higher-volume ROW, not necessarily the heaviest one');
  assert.equal(body.totalVolume, 2300);
  assert.deepEqual(body.heaviestWeightRecord, { weight: 80, reps: 5 });
  assert.equal(body.highestVolumeSession.volume, 1500);
  assert.deepEqual(body.bestRepsRecord, { reps: 10, weight: 50 });
  assert.equal(body.personalRecord.exerciseName, 'Barbell Bench Press');
  assert.equal(body.personalRecord.maxWeight, 80);
  assert.equal(body.personalRecord.maxVolumeSession, 1500);
});

// ---- Ownership isolation ----

test("another user's summary/history/logged-exercises never reflect someone else's data", async () => {
  await finishedWorkoutAs(UID_A, "A's Workout", [{ exerciseId: 'barbell-bench-press', sets: 3, reps: 8, weight: 60 }]);

  const summaryRes = await fetch(`${baseUrl}/api/analytics/summary`, { headers: testAuthHeader(UID_B) });
  assert.deepEqual(await summaryRes.json(), { totalWorkouts: 0, totalVolume: 0, totalSets: 0, currentStreak: 0 });

  const historyRes = await fetch(`${baseUrl}/api/analytics/history-by-date`, { headers: testAuthHeader(UID_B) });
  assert.deepEqual(await historyRes.json(), []);

  const loggedRes = await fetch(`${baseUrl}/api/analytics/exercises/logged`, { headers: testAuthHeader(UID_B) });
  assert.deepEqual(await loggedRes.json(), []);

  const statsRes = await fetch(`${baseUrl}/api/analytics/exercises/barbell-bench-press/stats`, { headers: testAuthHeader(UID_B) });
  assert.equal(await statsRes.json(), null, "B must not see A's PR for an exercise B never logged");
});

// ---- Date boundaries ----

test('volume-by-day excludes a workout finished outside the requested window', async () => {
  const inWindow = await finishedWorkoutAs(UID_A, 'In Window', [{ exerciseId: 'plank', sets: 1, reps: 1, weight: 100 }]);
  const outOfWindow = await finishedWorkoutAs(UID_A, 'Out Of Window', [{ exerciseId: 'plank', sets: 1, reps: 1, weight: 999 }]);
  await backdate(outOfWindow.id, 10);

  const res = await fetch(`${baseUrl}/api/analytics/volume-by-day?days=3`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any[];
  const total = body.reduce((s: number, d: any) => s + d.volume, 0);
  assert.equal(total, 100, 'the 10-day-old workout must not be counted in a 3-day window');
  void inWindow;
});

test('frequency excludes a workout finished outside the requested window', async () => {
  const recent = await finishedWorkoutAs(UID_A, 'Recent', []);
  const old = await finishedWorkoutAs(UID_A, 'Old', []);
  await backdate(old.id, 20);
  void recent;

  const res = await fetch(`${baseUrl}/api/analytics/frequency?weeks=1`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any[];
  const total = body.reduce((s: number, d: any) => s + d.count, 0);
  assert.equal(total, 1, 'only the recent (in-window) workout should be counted');
});

test('streak counts a workout gap correctly (yesterday + today = 2, with a gap = 1)', async () => {
  const today = await finishedWorkoutAs(UID_A, 'Today', []);
  void today;
  const res1 = await fetch(`${baseUrl}/api/analytics/streak`, { headers: testAuthHeader(UID_A) });
  assert.deepEqual(await res1.json(), { currentStreak: 1 });

  const yesterday = await finishedWorkoutAs(UID_A, 'Yesterday', []);
  await backdate(yesterday.id, 1);
  const res2 = await fetch(`${baseUrl}/api/analytics/streak`, { headers: testAuthHeader(UID_A) });
  assert.deepEqual(await res2.json(), { currentStreak: 2 }, 'consecutive days must extend the streak');
});

test('streak does not bridge a gap of more than one day', async () => {
  const gapped = await finishedWorkoutAs(UID_A, 'Three Days Ago', []);
  await backdate(gapped.id, 3);
  const res = await fetch(`${baseUrl}/api/analytics/streak`, { headers: testAuthHeader(UID_A) });
  assert.deepEqual(await res.json(), { currentStreak: 0 }, 'a 3-day-old workout with nothing since must not count as an active streak');
});

test('exercise progress range=7d excludes an old session that range=all includes', async () => {
  const old = await finishedWorkoutAs(UID_A, 'Old Session', [{ exerciseId: 'plank', sets: 1, reps: 1, weight: 50 }]);
  await backdate(old.id, 10);

  const rangeRes = await fetch(`${baseUrl}/api/analytics/exercises/plank/progress?range=7d`, { headers: testAuthHeader(UID_A) });
  assert.deepEqual(await rangeRes.json(), []);

  const allRes = await fetch(`${baseUrl}/api/analytics/exercises/plank/progress?range=all`, { headers: testAuthHeader(UID_A) });
  const allBody = (await allRes.json()) as any[];
  assert.equal(allBody.length, 1);
});

// ---- Seed integrity ----

test('seed data is unchanged after the full analytics test run', async () => {
  assert.equal(await prisma.exercise.count(), 71);
  assert.equal(await prisma.routine.count({ where: { isSystemDefault: true } }), 4);
  assert.equal(
    await prisma.routineExercise.count({ where: { routine: { isSystemDefault: true } } }),
    20,
  );
});
