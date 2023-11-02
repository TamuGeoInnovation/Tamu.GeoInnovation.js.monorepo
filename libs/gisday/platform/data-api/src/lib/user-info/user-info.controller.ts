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
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';

import { ManagementService } from '@tamu-gisc/common/nest/auth';
import { JwtGuard } from '@tamu-gisc/oidc/common';

import { UserInfo } from '../entities/all.entity';
import { UserInfoProvider } from './user-info.provider';

@Controller('user-infos')
export class UserInfoController {
  constructor(private readonly provider: UserInfoProvider, private readonly managementService: ManagementService) {}

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
    if (req.user) {
      return this.managementService.getUserMetadata(req.user.sub);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtGuard)
  @Post()
  public async insertEntity(@Body() body: Partial<UserInfo>) {
    throw new NotImplementedException();
  }

  @UseGuards(JwtGuard)
  @Patch()
  public async updateEntity(@Body() body: Partial<UserInfo>, @Request() req) {
    if (req.user) {
      return this.managementService.updateUserMetadata(req.user.sub, body);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    throw new NotImplementedException();
  }
}
