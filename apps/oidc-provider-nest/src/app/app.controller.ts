import { Controller, Get, Next, Param, Req, Res, Post } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  public getHello(): string {
    return this.appService.getHello();
  }

  @Get('auth/:uid')
  async authGet(@Param() params, @Req() req: Request, @Res() res: Response) {
    console.log('auth/:uid');
    debugger
  }
}
