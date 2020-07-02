import { Controller, Get, Next, Param, Req, Res, Post } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  public getHello(): string {
    return this.appService.getHello();
  }

  @Get('me')
  async meGet(@Param() params, @Req() req: Request, @Res() res: Response) {
    return 'hello from /me to you';
  }

  @Get(':uid')
  async authGet(@Param() params, @Next() next) {
      console.log("authGet", params.uid);
      return next();
  }

  @Get('oidc/auth/:uid')
  async authGet2(@Param() params, @Next() next) {
      console.log("authGet2", params.uid);
      return next();
  }

  @Get('auth/:uid')
  async authGet3(@Param() params, @Next() next) {
      console.log("authGet3", params.uid);
      return next();
  }

}
