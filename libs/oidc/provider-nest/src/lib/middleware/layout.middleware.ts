import { Injectable, NestMiddleware, Render } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LayoutMiddleware implements NestMiddleware {
  //https://idp-dev.geoservices.tamu.edu/
  use(req: Request, res: Response, next: Function) {
    console.log("LayoutMiddleware");
    const orig = res.render;
    // res.render = (view, locals) => {
    //   res.render('login', (err: Error, html: string) => {
    //     if (err) throw err;
    //     orig.call(res, '_layout', {
    //       ...locals,
    //       body: html
    //     })
    //   });
    // };
    // const joe = (view, locals) => {
    //   console.log("View", view, "Locals", locals);
    // }
    // joe("IMA VIEW", "YOU LOCAL?");
    // res.render = (view, locals) => {
    //     console.log("View", view, "Locals", locals);
    //   // res.render(view, locals, (err, html) => {
    //   //   orig.call(res, '_layout', {
    //   //     ...locals,
    //   //     body: html
    //   //   })
    //   // })
    // }
      
    next();
  }
}
