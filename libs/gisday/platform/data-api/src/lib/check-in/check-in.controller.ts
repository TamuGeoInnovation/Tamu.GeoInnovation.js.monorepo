import {
  Controller,
  Get,
  Post,
  Request,
  Body,
  UseGuards,
  ForbiddenException,
  Param,
  Delete,
  Patch,
  NotImplementedException
} from '@nestjs/common';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { CheckInProvider } from './check-in.provider';

@Controller('check-ins')
export class CheckInController {
  constructor(private readonly provider: CheckInProvider) {}

  @Get(':guid')
  public async getUserCheckins(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Get()
  @UseGuards(JwtGuard)
  public async getUsersCheckins(@Request() req) {
    if (req.user) {
      return this.provider.find({
        where: {
          accountGuid: req.user.sub
        }
      });
    } else {
      return new ForbiddenException();
    }
  }

  @Post()
  @UseGuards(JwtGuard)
  public async insertUserCheckin(@Body() body) {
    // TODO: Use HttpInterceptor to bind accountGuid to body since NestAuthGuard only allows request to progress here
    const { eventGuid, accountGuid } = body;

    return this.provider.insertUserCheckin(eventGuid, accountGuid);
  }

  @Patch()
  @UseGuards(JwtGuard)
  public async updateEntity(@Body() body) {
    throw new NotImplementedException();
  }

  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    return this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
