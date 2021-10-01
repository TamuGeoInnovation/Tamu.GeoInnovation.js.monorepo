import { Request } from 'express';

export function getResourceBaseUrl(req: Request, trimLastSegment?: boolean) {
  const pathHasTrailingSlash = req.path.charAt(req.path.length - 1) === '/';
  let path = pathHasTrailingSlash ? req.path.slice(0, req.path.length - 1) : req.path;

  if (trimLastSegment) {
    const segments = path.split('/');
    path = segments.slice(0, segments.length - 1).join('/');
  }

  return `${req.protocol}://${req.get('host')}${path}`;
}
