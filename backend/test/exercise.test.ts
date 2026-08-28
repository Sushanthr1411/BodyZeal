import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { startTestServer, stopTestServer } from './helpers/testServer';

let server: Server;
let baseUrl: string;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
});

after(async () => {
  await stopTestServer(server);
});

test('GET /api/exercises with no filters returns all 71 seeded exercises', async () => {
  const res = await fetch(`${baseUrl}/api/exercises`);
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.equal(Array.isArray(body), true);
  assert.equal(body.length, 71);
  // Response shape matches frontend/src/types/workout.ts's Exercise exactly.
  assert.deepEqual(Object.keys(body[0]).sort(), ['equipment', 'id', 'muscleGroup', 'name']);
});

test('GET /api/exercises?muscle=biceps returns only Biceps exercises', async () => {
  const res = await fetch(`${baseUrl}/api/exercises?muscle=biceps`);
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.ok(body.length > 0);
  assert.ok(body.every((e: { muscleGroup: string }) => e.muscleGroup === 'Biceps'));
});

test('GET /api/exercises?equipment=dumbbell returns only Dumbbell exercises', async () => {
  const res = await fetch(`${baseUrl}/api/exercises?equipment=dumbbell`);
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.ok(body.length > 0);
  assert.ok(body.every((e: { equipment: string }) => e.equipment === 'Dumbbell'));
});

test('GET /api/exercises?muscle=biceps&equipment=dumbbell combines both filters', async () => {
  const res = await fetch(`${baseUrl}/api/exercises?muscle=biceps&equipment=dumbbell`);
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.ok(body.length > 0);
  assert.ok(body.every((e: { muscleGroup: string; equipment: string }) => e.muscleGroup === 'Biceps' && e.equipment === 'Dumbbell'));
  assert.ok(body.some((e: { id: string }) => e.id === 'dumbbell-bicep-curl'));
});

test('GET /api/exercises?muscle=calves&equipment=cable_machine returns an empty array, not an error', async () => {
  // No calves exercise in the seed data uses a cable machine.
  const res = await fetch(`${baseUrl}/api/exercises?muscle=calves&equipment=cable_machine`);
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.deepEqual(body, []);
});

test('GET /api/exercises?muscle=not-a-real-muscle returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/exercises?muscle=not-a-real-muscle`);
  assert.equal(res.status, 400);
  const body = (await res.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('GET /api/exercises?equipment=not-a-real-equipment returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/exercises?equipment=not-a-real-equipment`);
  assert.equal(res.status, 400);
});

test('GET /api/exercises/:id returns the exercise for a known id', async () => {
  const res = await fetch(`${baseUrl}/api/exercises/barbell-bench-press`);
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.deepEqual(body, {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    equipment: 'Barbell / Rod',
    muscleGroup: 'Chest',
  });
});

test('GET /api/exercises/:id returns 404 for an unknown id', async () => {
  const res = await fetch(`${baseUrl}/api/exercises/does-not-exist`);
  assert.equal(res.status, 404);
  const body = (await res.json()) as any;
  assert.equal(body.error.code, 'NOT_FOUND');
});
