import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { Place } from '../entities/all.entity';
import { PlaceService } from './place.service';

@Controller('places')
export class PlaceController {
  constructor(private readonly ps: PlaceService) {}

  @Get('season/:guid')
  public getPlacesForSeason(@Param('guid') guid: string) {
    return this.ps.getPlacesForSeason(guid);
  }

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.ps.getEntity(guid);
  }

  @Get()
  public async getEntities() {
    return this.ps.getEntities();
  }

  @Permissions(['create:places'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('clone')
  public async copy(
    @Body('seasonGuid') seasonGuid: string,
    @Body('existingEntityGuids') existingEntityGuids?: Array<string>
  ) {
    return this.ps.copyPlacesIntoSeason(seasonGuid, existingEntityGuids);
  }

  @Permissions(['create:places'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  public async insertEntity(@Body() body: Partial<Place>, @UploadedFile() file?: Express.Multer.File) {
    return this.ps.createPlace(body, file);
  }

  @Permissions(['update:places'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  @UseInterceptors(FileInterceptor('file'))
  public async updateEntity(
    @Param('guid') guid: string,
    @Body() body: Partial<Place>,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.ps.updatePlace(guid, body, file);
  }

  @Permissions(['delete:places'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    return this.ps.deleteEntities(guid);
  }
}
