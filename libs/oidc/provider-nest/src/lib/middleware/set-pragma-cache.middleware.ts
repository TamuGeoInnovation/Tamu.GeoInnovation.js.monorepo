import {} from 'oidc-provider';
import { Response, Request, NextFunction } from 'express';

export async function setPragmaAndCache(req: Request, res: Response, next: NextFunction) {
  res.set("Pragma", "no-cache");
  res.set("Cache-Control", "no-cache, no-store");
  try {
    await next();
  } catch (err) {
    // if (err instanceof errors.SessionNotFound) {
      res.status = err.status;
      const { message: error, error_description } = err;
      // renderError(ctx, { error, error_description }, err);
    // } else {
    //   throw err;
    // }
  }
}
