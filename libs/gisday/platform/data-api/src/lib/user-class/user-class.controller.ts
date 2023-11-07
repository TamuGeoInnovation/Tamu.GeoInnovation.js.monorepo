import {
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
  Req,
  Request,
  UseGuards
} from '@nestjs/common';

import { UserClassProvider } from './user-class.provider';
import { JwtGuard } from '@tamu-gisc/common/nest/auth';

@Controller('user-classes')
export class UserClassController {
  constructor(private readonly provider: UserClassProvider) {}

  @UseGuards(JwtGuard)
  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    throw new NotImplementedException();
  }

  @UseGuards(JwtGuard)
  @Get()
  public async getUserClasses(@Request() req) {
    const accountGuid = req.user.sub;

    return this.provider.getUserClasses(accountGuid);
  }

  @UseGuards(JwtGuard)
  @Post()
  public async insertUserClass(@Request() req) {
    const chosenClass: string = req.body.guid;
    const accountGuid = req.user.sub;

    return this.provider.insertUserClass(chosenClass, accountGuid);
  }

  @UseGuards(JwtGuard)
  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string) {
    throw new NotImplementedException();
  }

  @UseGuards(JwtGuard)
  @Delete(':guid')
  public deleteEntity(@Req() req, @Param('guid') guid: string) {
    return this.provider.deleteUserClassRegistration(guid, req.user.sub);
  }
}
