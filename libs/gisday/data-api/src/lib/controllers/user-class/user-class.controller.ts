import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserClass } from '../../entities/all.entity';
import { UserClassProvider } from '../../providers/user-class/user-class.provider';
import { BaseController } from '../_base/base.controller';

@Controller('user-class')
export class UserClassController extends BaseController<UserClass> {
  constructor(private readonly userClassProvider: UserClassProvider) {
    super(userClassProvider);
  }

  @Get('/user/:guid')
  async getUsersClasses(@Param() params) {
    return this.userClassProvider.userClassRepo.getUsersClasses(params.guid);
  }

  @Post('/')
  async insertUserClass(@Req() req: Request) {
    return this.userClassProvider.insertUserClass(req);
  }
}
