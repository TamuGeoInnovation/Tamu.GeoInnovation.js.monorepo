import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { Place } from '../entities/all.entity';
import { PlaceService } from './place.service';

@Controller('places')
export class PlaceController {
  constructor(private readonly ps: PlaceService) {}

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.ps.findOne({
      where: {
        guid: guid
      },
      relations: ['links']
    });
  }

  @Get()
  public async getEntities() {
    return this.ps.getEntities();
  }

  @Permissions(['create:places'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEntity(@Body() body: Partial<Place>) {
    return this.ps.create(body);
  }

  @Permissions(['update:places'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() body: Partial<Place>) {
    return this.ps.update(guid, body);
  }

  @Permissions(['delete:places'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    return this.ps.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
