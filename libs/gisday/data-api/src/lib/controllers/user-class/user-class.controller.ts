import { Controller, Delete, Get, Post, Req } from '@nestjs/common';

import { Request } from 'express';

import { UserClass } from '../../entities/all.entity';
import { UserClassProvider } from '../../providers/user-class/user-class.provider';
import { BaseController } from '../_base/base.controller';

@Controller('user-class')
export class UserClassController extends BaseController<UserClass> {
  constructor(private readonly userClassProvider: UserClassProvider) {
    super(userClassProvider);
  }

  @Get()
  public async getClassesAndUserClasses(@Req() req: Request) {
    return this.userClassProvider.getClassesAndUserClasses(req);
  }

  @Post('/')
  public async insertUserClass(@Req() req: Request) {
    return this.userClassProvider.insertUserClass(req);
  }

  @Delete()
  public async deleteUserClassWithClassGuid(@Req() req: Request) {
    return this.userClassProvider.deleteUserClassWithClassGuid(req);
  }
}
