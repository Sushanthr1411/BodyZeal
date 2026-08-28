import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { startTestServer, stopTestServer, installFakeVerifyIdToken, testAuthHeader } from './helpers/testServer';
import { prisma } from '../src/config/prisma';

let server: Server;
let baseUrl: string;
let restoreVerify: () => void;

const STAMP = Date.now();
const UID_A = `test-routine-a-${STAMP}`;
const UID_B = `test-routine-b-${STAMP}`;
const createdRoutineIds: string[] = [];

function jsonHeaders(uid: string) {
  return { ...testAuthHeader(uid), 'Content-Type': 'application/json' };
}

async function createRoutineAs(uid: string, body: unknown) {
  const res = await fetch(`${baseUrl}/api/routines`, { method: 'POST', headers: jsonHeaders(uid), body: JSON.stringify(body) });
  const json = (await res.json()) as any;
  if (res.status === 201) createdRoutineIds.push(json.id);
  return { status: res.status, body: json };
}

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  restoreVerify = installFakeVerifyIdToken();
});

after(async () => {
  restoreVerify();
  await prisma.routine.deleteMany({ where: { id: { in: createdRoutineIds } } }); // cascades to routine_exercises
  await prisma.user.deleteMany({ where: { id: { in: [UID_A, UID_B] } } });
  await prisma.$disconnect();
  await stopTestServer(server);
});

// ---- System routines: visible, read-only ----

test('authenticated user can retrieve system routines', async () => {
  const res = await fetch(`${baseUrl}/api/routines`, { headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 200);
  const body = (await res.json()) as any[];
  const pushDay = body.find((r) => r.id === 'push-day');
  assert.ok(pushDay, 'seeded "push-day" system routine should be visible');
  assert.equal(pushDay.isSystemDefault, true);
  assert.equal(pushDay.exercises.length, 5);
});

test('GET /api/routines without a token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/routines`);
  assert.equal(res.status, 401);
});

test('system routines cannot be modified', async () => {
  const res = await fetch(`${baseUrl}/api/routines/push-day`, {
    method: 'PUT',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ name: 'Hacked', exercises: [{ exerciseId: 'push-up', plannedSets: 3 }] }),
  });
  assert.equal(res.status, 403);
  const body = (await res.json()) as any;
  assert.equal(body.error.code, 'FORBIDDEN');

  // and it's provably untouched
  const check = await fetch(`${baseUrl}/api/routines`, { headers: testAuthHeader(UID_A) });
  const list = (await check.json()) as any[];
  assert.equal(list.find((r) => r.id === 'push-day').name, 'Push Day');
});

test('system routines cannot be deleted', async () => {
  const res = await fetch(`${baseUrl}/api/routines/push-day`, { method: 'DELETE', headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 403);

  const check = await fetch(`${baseUrl}/api/routines`, { headers: testAuthHeader(UID_A) });
  const list = (await check.json()) as any[];
  assert.ok(list.some((r) => r.id === 'push-day'), 'push-day must still exist');
});

// ---- Custom routines: create, own, read, update, delete ----

test('authenticated user can create a custom routine, owned by their UID', async () => {
  const { status, body } = await createRoutineAs(UID_A, {
    name: 'Test Arm Day',
    exercises: [
      { exerciseId: 'dumbbell-bicep-curl', plannedSets: 3 },
      { exerciseId: 'hammer-curl', plannedSets: 4 },
    ],
  });
  assert.equal(status, 201);
  assert.equal(body.name, 'Test Arm Day');
  assert.equal(body.isSystemDefault, false);

  const row = await prisma.routine.findUnique({ where: { id: body.id } });
  assert.equal(row!.userId, UID_A, 'ownership must be req.user.uid, not anything client-supplied');
});

test('a client-supplied userId in the body is ignored — ownership always comes from the token', async () => {
  const { status, body } = await createRoutineAs(UID_A, {
    name: 'Spoof Attempt',
    userId: UID_B, // not part of the schema — .strict() should reject this outright
    exercises: [{ exerciseId: 'plank', plannedSets: 3 }],
  });
  assert.equal(status, 400, 'unknown fields like a client-supplied userId must be rejected by .strict()');
  void body;
});

test('owner can retrieve their own custom routine via the list endpoint', async () => {
  const { body: created } = await createRoutineAs(UID_A, {
    name: 'Owned By A',
    exercises: [{ exerciseId: 'plank', plannedSets: 3 }],
  });
  const res = await fetch(`${baseUrl}/api/routines`, { headers: testAuthHeader(UID_A) });
  const list = (await res.json()) as any[];
  assert.ok(list.some((r) => r.id === created.id));
});

test("another user cannot see a private custom routine in their own list", async () => {
  const { body: created } = await createRoutineAs(UID_A, {
    name: 'Private To A',
    exercises: [{ exerciseId: 'plank', plannedSets: 3 }],
  });
  const res = await fetch(`${baseUrl}/api/routines`, { headers: testAuthHeader(UID_B) });
  const list = (await res.json()) as any[];
  assert.ok(!list.some((r) => r.id === created.id), "B's list must not contain A's private routine");
});

test('owner can update their own custom routine', async () => {
  const { body: created } = await createRoutineAs(UID_A, {
    name: 'Before Update',
    exercises: [{ exerciseId: 'plank', plannedSets: 3 }],
  });
  const res = await fetch(`${baseUrl}/api/routines/${created.id}`, {
    method: 'PUT',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ name: 'After Update', exercises: [{ exerciseId: 'glute-bridge', plannedSets: 5 }] }),
  });
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.equal(body.name, 'After Update');
  assert.deepEqual(body.exercises, [{ exerciseId: 'glute-bridge', plannedSets: 5 }]);
});

test('another user cannot update someone else\'s custom routine', async () => {
  const { body: created } = await createRoutineAs(UID_A, {
    name: "A's Routine",
    exercises: [{ exerciseId: 'plank', plannedSets: 3 }],
  });
  const res = await fetch(`${baseUrl}/api/routines/${created.id}`, {
    method: 'PUT',
    headers: jsonHeaders(UID_B),
    body: JSON.stringify({ name: 'Hijacked', exercises: [{ exerciseId: 'push-up', plannedSets: 3 }] }),
  });
  assert.equal(res.status, 404, "must look identical to 'not found' — existence of A's private routine isn't leaked to B");

  const stillA = await prisma.routine.findUnique({ where: { id: created.id } });
  assert.equal(stillA!.name, "A's Routine");
});

test('owner can delete their own custom routine', async () => {
  const { body: created } = await createRoutineAs(UID_A, {
    name: 'To Delete',
    exercises: [{ exerciseId: 'plank', plannedSets: 3 }],
  });
  const res = await fetch(`${baseUrl}/api/routines/${created.id}`, { method: 'DELETE', headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 204);

  const row = await prisma.routine.findUnique({ where: { id: created.id } });
  assert.equal(row, null);
  const children = await prisma.routineExercise.findMany({ where: { routineId: created.id } });
  assert.equal(children.length, 0, 'routine_exercises must cascade-delete too');
});

test("another user cannot delete someone else's custom routine", async () => {
  const { body: created } = await createRoutineAs(UID_A, {
    name: 'A Keeps This',
    exercises: [{ exerciseId: 'plank', plannedSets: 3 }],
  });
  const res = await fetch(`${baseUrl}/api/routines/${created.id}`, { method: 'DELETE', headers: testAuthHeader(UID_B) });
  assert.equal(res.status, 404);

  const row = await prisma.routine.findUnique({ where: { id: created.id } });
  assert.ok(row, "A's routine must still exist");
});

test('deleting a routine referenced by a workout session returns 409, not 500 or a silent success', async () => {
  const { body: routine } = await createRoutineAs(UID_A, {
    name: 'Referenced By History',
    exercises: [{ exerciseId: 'plank', plannedSets: 3 }],
  });
  const startRes = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ routineId: routine.id, name: 'Referenced By History' }),
  });
  const session = (await startRes.json()) as any;
  await fetch(`${baseUrl}/api/sessions/${session.id}/finish`, { method: 'POST', headers: testAuthHeader(UID_A) });

  const res = await fetch(`${baseUrl}/api/routines/${routine.id}`, { method: 'DELETE', headers: testAuthHeader(UID_A) });
  assert.equal(res.status, 409);
  const body = (await res.json()) as any;
  assert.equal(body.error.code, 'CONFLICT');

  const stillThere = await prisma.routine.findUnique({ where: { id: routine.id } });
  assert.ok(stillThere, 'the routine must not have been deleted');
  const sessionRow = await prisma.workoutSession.findUnique({ where: { id: session.id } });
  assert.equal(sessionRow!.routineId, routine.id, "the finished session's routine link must be untouched");
});

// ---- Validation ----

test('an unknown exerciseId is rejected', async () => {
  const { status, body } = await createRoutineAs(UID_A, {
    name: 'Bad Exercise Ref',
    exercises: [{ exerciseId: 'this-exercise-does-not-exist', plannedSets: 3 }],
  });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('a routine with no exercises is rejected', async () => {
  const { status } = await createRoutineAs(UID_A, { name: 'Empty', exercises: [] });
  assert.equal(status, 400);
});

test('a routine with a blank name is rejected', async () => {
  const { status } = await createRoutineAs(UID_A, { name: '   ', exercises: [{ exerciseId: 'plank', plannedSets: 3 }] });
  assert.equal(status, 400);
});

test('a routine with a duplicate exerciseId is rejected', async () => {
  const { status, body } = await createRoutineAs(UID_A, {
    name: 'Dupes',
    exercises: [
      { exerciseId: 'plank', plannedSets: 3 },
      { exerciseId: 'plank', plannedSets: 4 },
    ],
  });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('plannedSets outside 1-10 is rejected', async () => {
  const { status } = await createRoutineAs(UID_A, { name: 'Bad Sets', exercises: [{ exerciseId: 'plank', plannedSets: 99 }] });
  assert.equal(status, 400);
});

test('POST /api/routines without a token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/routines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Nope', exercises: [{ exerciseId: 'plank', plannedSets: 3 }] }),
  });
  assert.equal(res.status, 401);
});

// ---- Ordering ----

test('exercise ordering is preserved through create and reflected on read', async () => {
  const order = ['leg-press', 'bodyweight-squat', 'dumbbell-lunges'];
  const { body: created } = await createRoutineAs(UID_A, {
    name: 'Ordering Check',
    exercises: order.map((exerciseId) => ({ exerciseId, plannedSets: 3 })),
  });
  assert.deepEqual(created.exercises.map((e: any) => e.exerciseId), order);

  const res = await fetch(`${baseUrl}/api/routines`, { headers: testAuthHeader(UID_A) });
  const list = (await res.json()) as any[];
  const fetched = list.find((r) => r.id === created.id);
  assert.deepEqual(fetched.exercises.map((e: any) => e.exerciseId), order);
});

test('exercise ordering is preserved through an update that reorders', async () => {
  const { body: created } = await createRoutineAs(UID_A, {
    name: 'Reorder Check',
    exercises: [
      { exerciseId: 'leg-press', plannedSets: 3 },
      { exerciseId: 'bodyweight-squat', plannedSets: 3 },
    ],
  });
  const reversed = ['bodyweight-squat', 'leg-press'];
  const res = await fetch(`${baseUrl}/api/routines/${created.id}`, {
    method: 'PUT',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ name: 'Reorder Check', exercises: reversed.map((exerciseId) => ({ exerciseId, plannedSets: 3 })) }),
  });
  const body = (await res.json()) as any;
  assert.deepEqual(body.exercises.map((e: any) => e.exerciseId), reversed);
});

// ---- Atomicity: a failed write leaves no partial records ----

test('a failed creation (bad exerciseId mixed with valid ones) leaves no routine behind', async () => {
  const before = await prisma.routine.count();
  const res = await fetch(`${baseUrl}/api/routines`, {
    method: 'POST',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({
      name: 'Should Not Exist',
      exercises: [
        { exerciseId: 'plank', plannedSets: 3 },
        { exerciseId: 'not-a-real-exercise', plannedSets: 3 },
      ],
    }),
  });
  assert.equal(res.status, 400);
  const after = await prisma.routine.count();
  assert.equal(after, before, 'routine count must be unchanged after a rejected create');
  const orphan = await prisma.routine.findFirst({ where: { name: 'Should Not Exist' } });
  assert.equal(orphan, null);
});

test('a failed update (bad exerciseId) leaves the original exercise list untouched', async () => {
  const { body: created } = await createRoutineAs(UID_A, {
    name: 'Update Atomicity',
    exercises: [{ exerciseId: 'plank', plannedSets: 3 }],
  });
  const res = await fetch(`${baseUrl}/api/routines/${created.id}`, {
    method: 'PUT',
    headers: jsonHeaders(UID_A),
    body: JSON.stringify({ name: 'Should Not Apply', exercises: [{ exerciseId: 'not-a-real-exercise', plannedSets: 3 }] }),
  });
  assert.equal(res.status, 400);

  const row = await prisma.routine.findUnique({
    where: { id: created.id },
    include: { exercises: true },
  });
  assert.equal(row!.name, 'Update Atomicity', 'name must be unchanged after a rejected update');
  assert.equal(row!.exercises.length, 1);
  assert.equal(row!.exercises[0]!.exerciseId, 'plank');
});
