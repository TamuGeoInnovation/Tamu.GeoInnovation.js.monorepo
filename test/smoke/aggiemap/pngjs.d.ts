/**
 * The part of `pngjs` the smoke suite uses (`paint.ts` and its spec), so `tsc -p test/smoke/aggiemap`
 * can check the calls (#1470). The workspace has no `@types/pngjs`; if it gains one, delete this file.
 */
declare module 'pngjs' {
  export class PNG {
    constructor(options?: { width?: number; height?: number });

    width: number;
    height: number;
    /** RGBA, four bytes per pixel, row by row. */
    data: Buffer;

    static sync: {
      read(buffer: Buffer): PNG;
      write(png: PNG): Buffer;
    };
  }
}
