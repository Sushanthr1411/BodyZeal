import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { startTestServer, stopTestServer, installFakeVerifyIdToken, testAuthHeader } from './helpers/testServer';
import { prisma } from '../src/config/prisma';

let server: Server;
let baseUrl: string;
let restoreVerify: () => void;

const TEST_UID = `test-profile-${Date.now()}`;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  restoreVerify = installFakeVerifyIdToken();
});

after(async () => {
  restoreVerify();
  await prisma.user.deleteMany({ where: { id: TEST_UID } }); // cascades to user_profiles
  await prisma.$disconnect();
  await stopTestServer(server);
});

test('GET /api/profile without a token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/profile`);
  assert.equal(res.status, 401);
  const body = (await res.json()) as any;
  assert.equal(body.error.code, 'UNAUTHORIZED');
});

test('GET /api/profile with an invalid token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/profile`, { headers: { Authorization: 'Bearer not-a-real-token' } });
  assert.equal(res.status, 401);
});

test('GET /api/profile JIT-provisions the user and returns null before onboarding', async () => {
  const res = await fetch(`${baseUrl}/api/profile`, { headers: testAuthHeader(TEST_UID) });
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.equal(body, null);

  const user = await prisma.user.findUnique({ where: { id: TEST_UID } });
  assert.ok(user, 'expected the authenticate middleware to JIT-provision a User row');
  assert.equal(user!.id, TEST_UID);
});

test('PUT /api/profile saves the profile, GET reflects it', async () => {
  const putRes = await fetch(`${baseUrl}/api/profile`, {
    method: 'PUT',
    headers: { ...testAuthHeader(TEST_UID), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test User',
      dateOfBirth: '1998-04-12',
      gender: 'prefer_not_to_say',
      height: 175,
      weight: 70,
      fitnessGoal: 'build_muscle',
      experienceLevel: 'intermediate',
    }),
  });
  assert.equal(putRes.status, 200);
  const putBody = (await putRes.json()) as any;
  assert.equal(putBody.fullName, 'Test User');
  assert.equal(putBody.dateOfBirth, '1998-04-12');
  assert.equal(putBody.gender, 'prefer_not_to_say');
  assert.equal(putBody.height, 175);
  assert.equal(putBody.weight, 70);
  assert.equal(putBody.fitnessGoal, 'build_muscle');
  assert.equal(putBody.experienceLevel, 'intermediate');

  const getRes = await fetch(`${baseUrl}/api/profile`, { headers: testAuthHeader(TEST_UID) });
  const getBody = (await getRes.json()) as any;
  assert.deepEqual(getBody, putBody);
});

test('PUT /api/profile with a partial body only changes the given fields', async () => {
  const res = await fetch(`${baseUrl}/api/profile`, {
    method: 'PUT',
    headers: { ...testAuthHeader(TEST_UID), 'Content-Type': 'application/json' },
    body: JSON.stringify({ weight: 72 }),
  });
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.equal(body.weight, 72);
  assert.equal(body.fullName, 'Test User', 'fullName from the previous PUT should be untouched');
});

test('PUT /api/profile with invalid data (bad enum) returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/profile`, {
    method: 'PUT',
    headers: { ...testAuthHeader(TEST_UID), 'Content-Type': 'application/json' },
    body: JSON.stringify({ gender: 'not-a-real-gender' }),
  });
  assert.equal(res.status, 400);
  const body = (await res.json()) as any;
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('PUT /api/profile with invalid data (negative height) returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/profile`, {
    method: 'PUT',
    headers: { ...testAuthHeader(TEST_UID), 'Content-Type': 'application/json' },
    body: JSON.stringify({ height: -10 }),
  });
  assert.equal(res.status, 400);
});

test('PUT /api/profile with an unknown field returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/profile`, {
    method: 'PUT',
    headers: { ...testAuthHeader(TEST_UID), 'Content-Type': 'application/json' },
    body: JSON.stringify({ notARealField: 'x' }),
  });
  assert.equal(res.status, 400);
});

test('PUT /api/profile without a token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Nope' }),
  });
  assert.equal(res.status, 401);
});
