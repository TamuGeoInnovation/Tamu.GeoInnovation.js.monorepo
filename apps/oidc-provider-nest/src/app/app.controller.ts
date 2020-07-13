import { Controller, Get, Next, Param, Req, Res, Post } from '@nestjs/common';
import { Request, Response } from 'express';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  public getHello(@Req() req: Request, @Res() res: Response): string {
    return this.appService.getHello(req, res);
  }
}
