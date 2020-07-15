import { Controller, Get, Next, Param, Req, Res, Post } from '@nestjs/common';
import { Request, Response } from 'express';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  public async getHello(@Req() req: Request, @Res() res: Response) {
    const account = await this.appService.getSignedInAccount(req, res);
    if (account) {
      return res.send(`Hello ${account.name}!`);
    } else {
      return res.send('Hello!');
    }
  }
}
