import { Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Class, UserClass } from '../../entities/all.entity';
import { NestAuthGuard } from '../../guards/auth.guard';
import { UserClassProvider } from '../../providers/user-class/user-class.provider';
import { BaseController } from '../_base/base.controller';

@Controller('user-class')
export class UserClassController extends BaseController<UserClass> {
  constructor(private readonly userClassProvider: UserClassProvider) {
    super(userClassProvider);
  }

  @UseGuards(NestAuthGuard)
  @Get()
  public async getClassesAndUserClasses(@Request() req) {
    if (req.user) {
      const accountGuid = req.user.sub;
      return this.userClassProvider.getClassesAndUserClasses(accountGuid);
    } else {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('/')
  public async insertUserClass(@Request() req) {
    if (req.user) {
      const chosenClass: DeepPartial<Class> = req.body.class;
      const accountGuid = req.user.sub;
      return this.userClassProvider.insertUserClass(chosenClass, accountGuid);
    } else {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @Delete()
  public async deleteUserClassWithClassGuid(@Body() body) {
    return this.userClassProvider.deleteUserClassWithClassGuid(body.classGuid);
  }
}
