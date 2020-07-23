import {} from 'oidc-provider';
import { Response, Request, NextFunction } from 'express';

export function setPragmaAndCache(req: Request, res: Response, next: NextFunction) {
  res.set("Pragma", "no-cache");
  res.set("Cache-Control", "no-cache, no-store");
  next();

}
