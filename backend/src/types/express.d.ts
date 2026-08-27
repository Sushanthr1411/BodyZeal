// Augments Express's Request type so `req.user` is known to every route/
// controller downstream of the `authenticate` middleware, without a cast.
export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string | null;
      };
    }
  }
}
