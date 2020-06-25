import { Response, Request, NextFunction } from 'express';

/**
 * Sets the CORs related headers so the Angular frontend can receive data: Access-Control-Allow-Origin
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function setCORs(req: Request, res: Response, next: NextFunction): void {
  res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.set('Access-Control-Allow-Credentials', 'true');
  next();
}
