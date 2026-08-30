import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { startTestServer, stopTestServer, installFakeVerifyIdToken, testAuthHeader } from './helpers/testServer';
import { prisma } from '../src/config/prisma';

let server: Server;
let baseUrl: string;
let restoreVerify: () => void;

const STAMP = Date.now();
const UID_A = `test-session-a-${STAMP}`;
const UID_B = `test-session-b-${STAMP}`;

function jsonHeaders(uid: string) {
  return { ...testAuthHeader(uid), 'Content-Type': 'application/json' };
}

async function startAs(uid: string, body: unknown = { name: 'Custom Session' }) {
  const res = await fetch(`${baseUrl}/api/sessions`, { method: 'POST', headers: jsonHeaders(uid), body: JSON.stringify(body) });
  const json = (await res.json()) as any;
  return { status: res.status, body: json };
}

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  restoreVerify = installFakeVerifyIdToken();
});

after(async () => {
  restoreVerify();
  // Cascades: User -> WorkoutSession -> WorkoutSet, and User -> Routine -> RoutineExercise.
  await prisma.user.deleteMany({ where: { id: { in: [UID_A, UID_B] } } });
  await prisma.$disconnect();
  await stopTestServer(server);
});

// Every session test starts from "no active session" for UID_A/UID_B — clear
// whatever the previous test left active so tests don't leak state into
// each other via the one-active-session-per-user rule.
beforeEach(async () => {
  await prisma.workoutSession.deleteMany({ where: { userId: { in: [UID_A, UID_B] } } });
});

// ---- Auth ----

test('POST /api/sessions without a token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Nope' }),
  });
  assert.equal(res.status, 401);
});

test('GET /api/sessions/active without a token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/sessions/active`);
  assert.equal(res.status, 401);
});

// ---- Start / retrieve ----

test('authenticated user can start a workout session, owned by their UID', async () => {
  const { status, body } = await startAs(UID_A, { name: 'Arm Day' });
  assert.equal(status, 201);
  assert.equal(body.workoutName, 'Arm Day');
  assert.equal(body.routineId, null);
  assert.equal(body.entries.length, 0);

  const row = await prisma.workoutSession.findUnique({ where: { id: body.id } });
  assert.equal(row!.userId, UID_A, 'ownership must come from req.user.uid');
  assert.equal(row!.status, 'ACTIVE');
});

test('a client-supplied userId in the create body is rejected (.strict())', async () => {
  const res = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ name: 'Spoof', userId: UID_B }),
  });
  assert.equal(res.status, 400);
});

test('active session can be retrieved via GET /api/sessions/active', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Leg Day' });
  const res = await fetch(`${baseUrl}/api/sessions/active`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.equal(body.id, started.id);
  assert.equal(body.workoutName, 'Leg Day');
});

test('GET /api/sessions/active returns null when there is no active session', async () => {
  const res = await fetch(`${baseUrl}/api/sessions/active`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 200);
  assert.equal((await res.json()), null);
});

test('starting a routine-based session seeds exercises and plannedSets from the routine', async () => {
  const { body: started } = await startAs(UID_A, { routineId: 'push-day', name: 'Push Day' });
  assert.equal(started.routineId, 'push-day');
  assert.equal(started.exercises.length, 5);
  assert.ok(started.plannedSets['barbell-bench-press'] >= 1);
});

test('starting a session with an invisible routineId is rejected', async () => {
  const res = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ routineId: 'not-a-real-routine', name: 'x' }),
  });
  assert.equal(res.status, 400);
});

test('a user cannot have two conflicting active sessions', async () => {
  await startAs(UID_A, { name: 'First' });
  const res = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ name: 'Second' }),
  });
  assert.equal(res.status, 409);
});

// ---- Logging sets ----

test('user can log a set, and volume is computed consistently on the backend', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Chest Day' });
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'barbell-bench-press', sets: 3, reps: 8, weight: 60 }),
  });
  assert.equal(res.status, 201);
  const body = (await res.json()) as any;
  assert.equal(body.exerciseName, 'Barbell Bench Press');
  assert.equal(body.volume, 3 * 8 * 60, 'volume must be sets*reps*weight, computed server-side');

  const row = await prisma.workoutSet.findUnique({ where: { id: body.id } });
  assert.equal(row!.volume, 1440);
  assert.equal(row!.userId, UID_A);
});

test('a client-supplied volume is ignored — the server always recomputes it', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Spoofed Volume' });
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'plank', sets: 1, reps: 1, weight: 1, volume: 999999 }),
  });
  assert.equal(res.status, 400, 'volume is not part of the schema — .strict() rejects it as an unknown field');
});

test('logging a set updates activeExerciseId to that exercise', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Focus Check' });
  await fetch(`${baseUrl}/api/sessions/${started.id}/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'pull-up', sets: 3, reps: 5, weight: 1 }),
  });
  const res = await fetch(`${baseUrl}/api/sessions/active`, { headers: testAuthHeader(UID_A) });
  const body = (await res.json()) as any;
  assert.equal(body.activeExerciseId, 'pull-up');
  assert.ok(body.exercises.some((e: any) => e.id === 'pull-up'), 'logged exercise must appear in the roster');
});

test('logging a set with an unknown exerciseId is rejected', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Bad Exercise' });
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'not-a-real-exercise', sets: 3, reps: 8, weight: 60 }),
  });
  assert.equal(res.status, 400);
  const body = (await res.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('invalid sets/reps/weight are rejected', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Bad Numbers' });
  const cases = [
    { exerciseId: 'plank', sets: 0, reps: 8, weight: 60 }, // sets must be >= 1
    { exerciseId: 'plank', sets: 3, reps: 0, weight: 60 }, // reps must be >= 1
    { exerciseId: 'plank', sets: 3, reps: 8, weight: -5 }, // weight must be positive
    { exerciseId: 'plank', sets: 3.5, reps: 8, weight: 60 }, // sets must be an integer
  ];
  for (const body of cases) {
    const res = await fetch(`${baseUrl}/api/sessions/${started.id}/sets`, {
      method: 'POST',
      headers: jsonHeaders(UID_A),
      body: JSON.stringify(body),
    });
    assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(body)}`);
  }
});

test('user can delete a logged set', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Delete Check' });
  const logRes = await fetch(`${baseUrl}/api/sessions/${started.id}/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'plank', sets: 3, reps: 8, weight: 1 }),
  });
  const set = (await logRes.json()) as any;

  const delRes = await fetch(`${baseUrl}/api/sessions/${started.id}/sets/${set.id}`, {
    method: 'DELETE',
    headers: testAuthHeader(UID_A),
  });
  assert.equal(delRes.status, 204);
  const row = await prisma.workoutSet.findUnique({ where: { id: set.id } });
  assert.equal(row, null);
});

// ---- Invalid session id ----

test('PATCH on an unknown session id returns 404', async () => {
  const res = await fetch(`${baseUrl}/api/sessions/not-a-real-session-id`, {
    method: 'PATCH',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ activeExerciseId: 'plank' }),
  });
  assert.equal(res.status, 404);
});

test('logging a set against an unknown session id returns 404', async () => {
  const res = await fetch(`${baseUrl}/api/sessions/not-a-real-session-id/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'plank', sets: 3, reps: 8, weight: 1 }),
  });
  assert.equal(res.status, 404);
});

// ---- Cross-user ownership ----

test('another user cannot see a session in GET /api/sessions/active', async () => {
  await startAs(UID_A, { name: "A's session" });
  const res = await fetch(`${baseUrl}/api/sessions/active`, { headers: testAuthHeader(UID_B) });
  assert.equal((await res.json()), null, "B's active-session view must not see A's session");
});

test('another user cannot modify (PATCH) someone else\'s session', async () => {
  const { body: started } = await startAs(UID_A, { name: "A's session" });
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}`, {
    method: 'PATCH',
    headers: jsonHeaders(UID_B),
    body: JSON.stringify({ activeExerciseId: 'plank' }),
  });
  assert.equal(res.status, 404);
});

test('another user cannot log a set against someone else\'s session', async () => {
  const { body: started } = await startAs(UID_A, { name: "A's session" });
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_B),
    body: JSON.stringify({ exerciseId: 'plank', sets: 3, reps: 8, weight: 1 }),
  });
  assert.equal(res.status, 404);
});

test('another user cannot finish someone else\'s session', async () => {
  const { body: started } = await startAs(UID_A, { name: "A's session" });
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/finish`, { method: 'POST', headers: testAuthHeader(UID_B) });
  assert.equal(res.status, 404);

  const row = await prisma.workoutSession.findUnique({ where: { id: started.id } });
  assert.equal(row!.status, 'ACTIVE', "A's session must remain untouched");
});

test('another user cannot delete a set from someone else\'s session', async () => {
  const { body: started } = await startAs(UID_A, { name: "A's session" });
  const logRes = await fetch(`${baseUrl}/api/sessions/${started.id}/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'plank', sets: 3, reps: 8, weight: 1 }),
  });
  const set = (await logRes.json()) as any;
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/sets/${set.id}`, {
    method: 'DELETE',
    headers: testAuthHeader(UID_B),
  });
  assert.equal(res.status, 404);
  const row = await prisma.workoutSet.findUnique({ where: { id: set.id } });
  assert.ok(row, "A's set must still exist");
});

// ---- Lifecycle: finish ----

test('an active session can be completed, with totals computed from logged sets', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Full Session' });
  await fetch(`${baseUrl}/api/sessions/${started.id}/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'barbell-bench-press', sets: 3, reps: 8, weight: 60 }),
  });
  await fetch(`${baseUrl}/api/sessions/${started.id}/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'pull-up', sets: 4, reps: 6, weight: 1 }),
  });

  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/finish`, { method: 'POST', headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.equal(body.totalSets, 2);
  assert.equal(body.totalVolume, 3 * 8 * 60 + 4 * 6 * 1);
  assert.equal(body.sets.length, 2);
  assert.ok(body.durationSeconds >= 0);

  const row = await prisma.workoutSession.findUnique({ where: { id: started.id } });
  assert.equal(row!.status, 'FINISHED');
  assert.equal(row!.totalSets, 2);

  const activeCheck = await fetch(`${baseUrl}/api/sessions/active`, { headers: testAuthHeader(UID_A) });
  assert.equal((await activeCheck.json()), null, 'a finished session must no longer be "active"');
});

test('finishing a session with no request body at all still succeeds (durationSeconds is optional)', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Bodyless Finish' });
  // Deliberately no Content-Type and no body — every finish caller in this test
  // suite exercises this exact shape, matching what the pre-existing endpoint
  // (before durationSeconds was added) always accepted.
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/finish`, { method: 'POST', headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.ok(body.durationSeconds >= 0);
});

test('finishing a session with an explicit durationSeconds is accepted', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Explicit Duration' });
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/finish`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ durationSeconds: 0 }),
  });
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  // durationSeconds is clamped to the real wall-clock elapsed time, which is
  // also ~0 here, so 0 is the one value guaranteed not to be clamped upward.
  assert.equal(body.durationSeconds, 0);
});

test('finishing a session with an invalid durationSeconds is rejected with 400', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Invalid Duration' });
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/finish`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ durationSeconds: -5 }),
  });
  assert.equal(res.status, 400);

  const row = await prisma.workoutSession.findUnique({ where: { id: started.id } });
  assert.equal(row!.status, 'ACTIVE', 'a rejected finish must not change session status');
});

test('a completed session cannot be finished again', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Double Finish' });
  await fetch(`${baseUrl}/api/sessions/${started.id}/finish`, { method: 'POST', headers: testAuthHeader(UID_A) });
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/finish`, { method: 'POST', headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 409);
});

test('a completed session cannot be modified (PATCH)', async () => {
  const { body: started } = await startAs(UID_A, { name: 'No Patch After Finish' });
  await fetch(`${baseUrl}/api/sessions/${started.id}/finish`, { method: 'POST', headers: testAuthHeader(UID_A) });
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}`, {
    method: 'PATCH',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ activeExerciseId: 'plank' }),
  });
  assert.equal(res.status, 409);
});

test('a completed session cannot have sets logged against it', async () => {
  const { body: started } = await startAs(UID_A, { name: 'No Sets After Finish' });
  await fetch(`${baseUrl}/api/sessions/${started.id}/finish`, { method: 'POST', headers: testAuthHeader(UID_A) });
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'plank', sets: 3, reps: 8, weight: 1 }),
  });
  assert.equal(res.status, 409);
});

// ---- Atomicity ----

test('a rejected set-log leaves no WorkoutSet row behind', async () => {
  const { body: started } = await startAs(UID_A, { name: 'Atomicity Check' });
  const before = await prisma.workoutSet.count({ where: { sessionId: started.id } });
  const res = await fetch(`${baseUrl}/api/sessions/${started.id}/sets`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ exerciseId: 'not-a-real-exercise', sets: 3, reps: 8, weight: 60 }),
  });
  assert.equal(res.status, 400);
  const after = await prisma.workoutSet.count({ where: { sessionId: started.id } });
  assert.equal(after, before, 'no row should exist after a rejected log-set call');
});

// ---- Seed data integrity ----

test('seed data is unchanged after the full session test run', async () => {
  // Scoped to the immutable seeded data only — the total routine/
  // routine_exercise count isn't asserted here, since a real (non-test)
  // account on this database may legitimately hold its own custom
  // routines (e.g. from manual verification) that this suite must not
  // require to be absent.
  const exercises = await prisma.exercise.count();
  const systemRoutines = await prisma.routine.count({ where: { isSystemDefault: true } });
  const systemRoutineExercises = await prisma.routineExercise.count({
    where: { routine: { isSystemDefault: true } },
  });
  assert.equal(exercises, 71);
  assert.equal(systemRoutines, 4);
  assert.equal(systemRoutineExercises, 20);
});
