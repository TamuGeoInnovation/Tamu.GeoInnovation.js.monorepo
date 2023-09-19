import {
  Body,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException
} from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Class } from '../entities/all.entity';
import { UserClassProvider } from './user-class.provider';

@Controller('user-classes')
export class UserClassController {
  constructor(private readonly provider: UserClassProvider) {}

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Get()
  public async getClassesAndUserClasses(@Request() req) {
    if (req.user) {
      const accountGuid = req.user.sub;

      return this.provider.getClassesAndUserClasses(accountGuid);
    } else {
      throw new UnauthorizedException();
    }
  }

  @Post()
  public async insertUserClass(@Request() req) {
    if (req.user) {
      const chosenClass: DeepPartial<Class> = req.body.class;
      const accountGuid = req.user.sub;

      return this.provider.insertUserClass(chosenClass, accountGuid);
    } else {
      throw new UnauthorizedException();
    }
  }

  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() body: DeepPartial<Class>) {
    throw new NotImplementedException();
  }

  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
