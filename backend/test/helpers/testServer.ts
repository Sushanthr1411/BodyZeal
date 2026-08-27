import http from 'node:http';
import { FinishReason, type GenerateContentParameters, type GenerateContentResponse } from '@google/genai';
import { createApp } from '../../src/app';
import { firebaseAuth } from '../../src/config/firebaseAdmin';
import { gemini } from '../../src/config/geminiClient';

/**
 * Starts the real Express app (real Prisma client, real DB from
 * backend/.env) on an ephemeral port so tests don't collide with a
 * `npm run dev` instance already bound to 8080.
 */
export async function startTestServer() {
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

export async function stopTestServer(server: http.Server) {
  await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
}

/**
 * Replaces the real firebase-admin verifyIdToken with a deterministic fake
 * for the duration of a test run, so tests don't depend on a live Firebase
 * round-trip or a real user's credentials. The real token-verification path
 * (signature check against Firebase's public keys) was already proven
 * end-to-end in Phase 2 against a real signed token; this boundary tests
 * OUR route/auth/ownership wiring, not Firebase's own JWT verification.
 *
 * Test tokens look like `test-token:<uid>:<email>` — anything else is
 * treated as invalid, exactly like a real malformed/expired token would be.
 */
export function installFakeVerifyIdToken() {
  const original = firebaseAuth.verifyIdToken.bind(firebaseAuth);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (firebaseAuth as any).verifyIdToken = async (idToken: string) => {
    if (idToken.startsWith('test-token:')) {
      const [, uid, email] = idToken.split(':');
      if (!uid) throw new Error('malformed test token');
      return { uid, email: email || null } as unknown as Awaited<ReturnType<typeof original>>;
    }
    throw new Error('invalid test token');
  };
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (firebaseAuth as any).verifyIdToken = original;
  };
}

export function testAuthHeader(uid: string, email = `${uid}@test.bodyzeal`) {
  return { Authorization: `Bearer test-token:${uid}:${email}` };
}

/**
 * Replaces `gemini.models.generateContent` with a fake for the duration of a
 * test — same monkey-patch pattern as installFakeVerifyIdToken above.
 * Automated tests must never make a real, billed Gemini API call.
 */
export function installFakeGeminiGenerateContent(
  impl: (params: GenerateContentParameters) => Promise<Partial<GenerateContentResponse>> | Partial<GenerateContentResponse>,
) {
  const original = gemini.models.generateContent.bind(gemini.models);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (gemini.models as any).generateContent = async (params: GenerateContentParameters) => impl(params);
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (gemini.models as any).generateContent = original;
  };
}

export function fakeGeminiResponse(text: string, finishReason: FinishReason = FinishReason.STOP): Partial<GenerateContentResponse> {
  return {
    text,
    candidates: [{ content: { role: 'model', parts: [{ text }] }, finishReason }],
    usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 10 } as GenerateContentResponse['usageMetadata'],
  };
}
