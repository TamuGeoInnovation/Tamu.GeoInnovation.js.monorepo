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
  UseGuards
} from '@nestjs/common';

import { JwtGuard } from '@tamu-gisc/oidc/common';

import { GisDayAppMetadata, UserInfoProvider } from './user-info.provider';

@Controller('users')
export class UserInfoController {
  constructor(private readonly provider: UserInfoProvider) {}

  @UseGuards(JwtGuard)
  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @UseGuards(JwtGuard)
  @Get()
  public async getUsersInfo(@Request() req) {
    return this.provider.getUsersInfo(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Post()
  public async insertEntity() {
    throw new NotImplementedException();
  }

  @UseGuards(JwtGuard)
  @Patch()
  public async updateEntity(@Request() req, @Body() body: GisDayAppMetadata) {
    return this.provider.updateUserInfo(req.user.sub, body);
  }

  @UseGuards(JwtGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    throw new NotImplementedException();
  }
}
