import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../errors/AppError';

type Schemas = Partial<{
  body: ZodTypeAny;
  query: ZodTypeAny;
  params: ZodTypeAny;
}>;

/**
 * Validates (and coerces — e.g. `?days=7` query strings into numbers) request
 * body/query/params against Zod schemas before the route handler runs. On
 * failure, short-circuits to a 400 VALIDATION_ERROR; the handler never sees
 * malformed input. No business routes exist yet in Phase 1 — this is wired
 * for Phase 2 onward.
 */
export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      // A request sent with no `Content-Type: application/json` (or no body at
      // all) leaves `req.body` as `undefined`, which fails every object schema
      // outright — even one where every field is optional (e.g. finishSessionSchema)
      // — with a generic "expected object, received undefined" instead of the
      // schema's own per-field rules. Defaulting to `{}` here makes "no body sent"
      // behave exactly like "an empty JSON object was sent": schemas with only
      // optional fields validate fine (preserving pre-existing bodyless-call
      // support), while schemas with required fields still correctly 400 with a
      // clear "field is required" message. No validation is weakened either way.
      const result = schemas.body.safeParse(req.body ?? {});
      if (!result.success) return next(toValidationError(result.error, 'body'));
      req.body = result.data;
    }
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) return next(toValidationError(result.error, 'query'));
      // Express 5 exposes `req.query` as a getter-only property (no setter),
      // so a plain `req.query = ...` throws — redefine the property instead.
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) return next(toValidationError(result.error, 'params'));
      req.params = result.data as typeof req.params;
    }
    next();
  };
}

function toValidationError(error: { issues: Array<{ path: (string | number)[]; message: string }> }, source: string) {
  const details = error.issues.map((issue) => ({
    field: `${source}.${issue.path.join('.')}`,
    issue: issue.message,
  }));
  return new AppError(400, 'VALIDATION_ERROR', 'Request failed validation', details);
}
