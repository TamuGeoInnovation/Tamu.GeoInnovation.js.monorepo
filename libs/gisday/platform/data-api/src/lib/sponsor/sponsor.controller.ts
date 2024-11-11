import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { Sponsor } from '../entities/all.entity';
import { SponsorProvider } from './sponsor.provider';

@Controller('sponsors')
export class SponsorController {
  constructor(private readonly provider: SponsorProvider) {}

  @Get('season/active')
  public getActive() {
    return this.provider.getSponsorsForActiveSeason();
  }

  @Get('season/:guid')
  public getSponsorsForSeason(@Param('guid') seasonGuid: string) {
    return this.provider.getSponsorsForSeason(seasonGuid);
  }

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      },
      relations: ['season', 'logos']
    });
  }

  @Get()
  public async getEntities() {
    return this.provider.find({
      relations: ['season', 'logos']
    });
  }

  @Permissions(['create:sponsors'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('clone')
  public copySponsorsIntoSeason(
    @Body('seasonGuid') seasonGuid: string,
    @Body('existingEntityGuids') existingEntityGuids: Array<string>
  ) {
    return this.provider.copyEntitiesIntoSeason(seasonGuid, existingEntityGuids);
  }

  @Permissions(['create:sponsors'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  public create(@Body() creteOrgDto?: Partial<Sponsor>, @UploadedFile() file?: Express.Multer.File) {
    return this.provider.createSponsor(creteOrgDto, file);
  }

  @Permissions(['update:sponsors'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  @UseInterceptors(FileInterceptor('file'))
  public update(
    @Param('guid') guid: string,
    @Body() updateOrgDto: Partial<Sponsor>,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.provider.updateSponsor(guid, updateOrgDto, file);
  }

  @Permissions(['delete:sponsors'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public remove(@Param('guid') guid: string) {
    return this.provider.deleteEntities(guid);
  }

  @Permissions(['delete:sponsors'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete()
  public removeMany(@Body('guid') guid: string) {
    return this.provider.deleteEntities(guid);
  }
}
