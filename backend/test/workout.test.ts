import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { startTestServer, stopTestServer, installFakeVerifyIdToken, testAuthHeader } from './helpers/testServer';
import { prisma } from '../src/config/prisma';

let server: Server;
let baseUrl: string;
let restoreVerify: () => void;

const STAMP = Date.now();
const UID_A = `test-workout-a-${STAMP}`;
const UID_B = `test-workout-b-${STAMP}`;

function jsonHeaders(uid: string) {
  return { ...testAuthHeader(uid), 'Content-Type': 'application/json' };
}

async function finishedWorkoutAs(uid: string, name: string, sets: { exerciseId: string; sets: number; reps: number; weight: number }[]) {
  const startRes = await fetch(`${baseUrl}/api/sessions`, { method: 'POST', headers: jsonHeaders(uid), body: JSON.stringify({ name }) });
  const session = (await startRes.json()) as any;
  for (const s of sets) {
    await fetch(`${baseUrl}/api/sessions/${session.id}/sets`, { method: 'POST', headers: jsonHeaders(uid), body: JSON.stringify(s) });
  }
  const finishRes = await fetch(`${baseUrl}/api/sessions/${session.id}/finish`, { method: 'POST', headers: testAuthHeader(uid) });
  return (await finishRes.json()) as any;
}

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  restoreVerify = installFakeVerifyIdToken();
});

after(async () => {
  restoreVerify();
  // Cascades: User -> WorkoutSession -> WorkoutSet, User -> WorkoutSet (quick-log).
  await prisma.user.deleteMany({ where: { id: { in: [UID_A, UID_B] } } });
  await prisma.$disconnect();
  await stopTestServer(server);
});

beforeEach(async () => {
  await prisma.workoutSession.deleteMany({ where: { userId: { in: [UID_A, UID_B] } } });
  await prisma.workoutSet.deleteMany({ where: { userId: { in: [UID_A, UID_B] }, sessionId: null } });
});

// ---- Auth ----

test('GET /api/workouts without a token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/workouts`);
  assert.equal(res.status, 401);
});

test('GET /api/workouts/today without a token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/workouts/today`);
  assert.equal(res.status, 401);
});

test('POST /api/workouts/quick-log without a token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/workouts/quick-log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exerciseId: 'plank', sets: 3, reps: 8, weight: 1 }),
  });
  assert.equal(res.status, 401);
});

// ---- History list ----

test('GET /api/workouts returns an empty array when nothing is finished yet', async () => {
  const res = await fetch(`${baseUrl}/api/workouts`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);
});

test('GET /api/workouts lists finished workouts, matching the RecentWorkout shape', async () => {
  const finished = await finishedWorkoutAs(UID_A, 'Push Day', [
    { exerciseId: 'barbell-bench-press', sets: 3, reps: 8, weight: 60 },
  ]);
  const res = await fetch(`${baseUrl}/api/workouts`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 200);
  const body = (await res.json()) as any[];
  assert.equal(body.length, 1);
  assert.equal(body[0].id, finished.id);
  assert.equal(body[0].name, 'Push Day');
  assert.equal(body[0].totalVolume, 1440);
  assert.equal(body[0].totalSets, 1);
  assert.deepEqual(body[0].sets, [{ exerciseName: 'Barbell Bench Press', reps: 8, weight: 60, volume: 1440 }]);
});

test('GET /api/workouts only returns the caller\'s own finished workouts', async () => {
  await finishedWorkoutAs(UID_A, "A's workout", [{ exerciseId: 'plank', sets: 1, reps: 1, weight: 1 }]);
  const res = await fetch(`${baseUrl}/api/workouts`, { headers: testAuthHeader(UID_B) });
  assert.deepEqual(await res.json(), []);
});

test('GET /api/workouts an active (unfinished) session does not appear in history', async () => {
  await fetch(`${baseUrl}/api/sessions`, { method: 'POST', headers: jsonHeaders(UID_A), body: JSON.stringify({ name: 'Still Going' }) });
  const res = await fetch(`${baseUrl}/api/workouts`, { headers: testAuthHeader(UID_A) });
  assert.deepEqual(await res.json(), []);
});

test('GET /api/workouts respects ?limit=', async () => {
  await finishedWorkoutAs(UID_A, 'One', []);
  await finishedWorkoutAs(UID_A, 'Two', []);
  const res = await fetch(`${baseUrl}/api/workouts?limit=1`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any[];
  assert.equal(body.length, 1);
  assert.equal(body[0].name, 'Two', 'most recently finished first');
});

test('GET /api/workouts?limit=0 is rejected', async () => {
  const res = await fetch(`${baseUrl}/api/workouts?limit=0`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 400);
});

// ---- Single workout ----

test('GET /api/workouts/:id returns a finished workout by id', async () => {
  const finished = await finishedWorkoutAs(UID_A, 'Leg Day', [{ exerciseId: 'leg-press', sets: 4, reps: 10, weight: 100 }]);
  const res = await fetch(`${baseUrl}/api/workouts/${finished.id}`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.equal(body.id, finished.id);
  assert.equal(body.totalVolume, 4000);
});

test('GET /api/workouts/:id returns 404 for an unknown id', async () => {
  const res = await fetch(`${baseUrl}/api/workouts/not-a-real-workout`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 404);
});

test('GET /api/workouts/:id returns 404 for another user\'s workout', async () => {
  const finished = await finishedWorkoutAs(UID_A, "A's Private Workout", []);
  const res = await fetch(`${baseUrl}/api/workouts/${finished.id}`, { headers: testAuthHeader(UID_B) });
  assert.equal(res.status, 404);
});

// ---- Quick-log ----

test('GET /api/workouts/today returns an empty array when nothing logged yet', async () => {
  const res = await fetch(`${baseUrl}/api/workouts/today`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);
});

test('POST /api/workouts/quick-log creates a sessionId=null WorkoutSet, and volume is server-computed', async () => {
  const res = await fetch(`${baseUrl}/api/workouts/quick-log`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'dumbbell-bicep-curl', sets: 3, reps: 12, weight: 14 }),
  });
  assert.equal(res.status, 201);
  const body = (await res.json()) as any;
  assert.equal(body.exerciseName, 'Dumbbell Bicep Curl');
  assert.equal(body.volume, 3 * 12 * 14);

  const row = await prisma.workoutSet.findUnique({ where: { id: body.id } });
  assert.equal(row!.sessionId, null, 'a quick-log entry must have sessionId = null');
  assert.equal(row!.userId, UID_A);
});

test('a quick-logged entry shows up in GET /api/workouts/today', async () => {
  const createRes = await fetch(`${baseUrl}/api/workouts/quick-log`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'plank', sets: 2, reps: 1, weight: 1 }),
  });
  const created = (await createRes.json()) as any;
  const res = await fetch(`${baseUrl}/api/workouts/today`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any[];
  assert.ok(body.some((e) => e.id === created.id));
});

test('a finished session\'s sets do NOT appear in GET /api/workouts/today (quick-log only)', async () => {
  await finishedWorkoutAs(UID_A, 'Session Sets', [{ exerciseId: 'plank', sets: 1, reps: 1, weight: 1 }]);
  const res = await fetch(`${baseUrl}/api/workouts/today`, { headers: testAuthHeader(UID_A) });
  assert.deepEqual(await res.json(), [], 'today endpoint is scoped to sessionId=null rows only');
});

test('quick-log with an unknown exerciseId is rejected', async () => {
  const res = await fetch(`${baseUrl}/api/workouts/quick-log`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'not-a-real-exercise', sets: 3, reps: 8, weight: 60 }),
  });
  assert.equal(res.status, 400);
  const body = (await res.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('quick-log with invalid sets/reps/weight is rejected', async () => {
  const cases = [
    { exerciseId: 'plank', sets: 0, reps: 8, weight: 60 },
    { exerciseId: 'plank', sets: 3, reps: 0, weight: 60 },
    { exerciseId: 'plank', sets: 3, reps: 8, weight: 0 },
    { exerciseId: 'plank', sets: 3, reps: 8, weight: -5 },
  ];
  for (const body of cases) {
    const res = await fetch(`${baseUrl}/api/workouts/quick-log`, { method: 'POST', headers: jsonHeaders(UID_A), body: JSON.stringify(body) });
    assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(body)}`);
  }
});

test('a client-supplied volume on quick-log is ignored (.strict() rejects it)', async () => {
  const res = await fetch(`${baseUrl}/api/workouts/quick-log`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'plank', sets: 1, reps: 1, weight: 1, volume: 999999 }),
  });
  assert.equal(res.status, 400);
});

test('owner can delete their own quick-log entry', async () => {
  const createRes = await fetch(`${baseUrl}/api/workouts/quick-log`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'plank', sets: 1, reps: 1, weight: 1 }),
  });
  const created = (await createRes.json()) as any;
  const res = await fetch(`${baseUrl}/api/workouts/quick-log/${created.id}`, { method: 'DELETE', headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 204);
  assert.equal(await prisma.workoutSet.findUnique({ where: { id: created.id } }), null);
});

test('another user cannot delete someone else\'s quick-log entry', async () => {
  const createRes = await fetch(`${baseUrl}/api/workouts/quick-log`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'plank', sets: 1, reps: 1, weight: 1 }),
  });
  const created = (await createRes.json()) as any;
  const res = await fetch(`${baseUrl}/api/workouts/quick-log/${created.id}`, { method: 'DELETE', headers: testAuthHeader(UID_B) });
  assert.equal(res.status, 404);
  assert.ok(await prisma.workoutSet.findUnique({ where: { id: created.id } }));
});

test('a session-scoped set cannot be deleted through the quick-log delete endpoint', async () => {
  const startRes = await fetch(`${baseUrl}/api/sessions`, { method: 'POST', headers: jsonHeaders(UID_A), body: JSON.stringify({ name: 'Not Quick Log' }) });
  const session = (await startRes.json()) as any;
  const setRes = await fetch(`${baseUrl}/api/sessions/${session.id}/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'plank', sets: 1, reps: 1, weight: 1 }),
  });
  const set = (await setRes.json()) as any;

  const res = await fetch(`${baseUrl}/api/workouts/quick-log/${set.id}`, { method: 'DELETE', headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 404, 'a session-scoped set is not a quick-log entry, even though the owner matches');
  assert.ok(await prisma.workoutSet.findUnique({ where: { id: set.id } }), 'the session set must be untouched');
});

// ---- Seed integrity ----

test('seed data is unchanged after the full workout test run', async () => {
  // Scoped to the immutable seeded data only — see the matching note in
  // session.test.ts. A real account's own custom routines/history on this
  // database (e.g. from manual verification) must not fail this assertion.
  assert.equal(await prisma.exercise.count(), 71);
  assert.equal(await prisma.routine.count({ where: { isSystemDefault: true } }), 4);
  assert.equal(
    await prisma.routineExercise.count({ where: { routine: { isSystemDefault: true } } }),
    20,
  );
});
