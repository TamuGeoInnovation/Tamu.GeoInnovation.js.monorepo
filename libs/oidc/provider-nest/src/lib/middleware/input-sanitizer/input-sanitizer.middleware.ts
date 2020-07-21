import { Request, Response } from 'express';

// TODO: Incomplete
export function InputSanitizerMiddleware(req: Request, res: Response, next: Function) {
  if (isEmptyObject(req.body)) {
    next();
  } else {
    const propNames: string[] = [];
    if (req.body && req.body != {}) {
      const keys = Object.keys(req.body);
      keys.map((key) => {
        let prop = req.body[key] as string;
        if (prop.includes('@')) {
          // this is an email, trim all whitespace
          prop = prop.replace(/\s+/g, '');
        }
        if (prop.includes('"')) {
          console.warn('Possible sql injection attempt');
        } else {
          prop = prop.trim();
        }
        req.body[key] = prop;
      });
    }

    next();
  }
}

function isEmptyObject(obj) {
  for (var i in obj) return false;
  return true;
}
