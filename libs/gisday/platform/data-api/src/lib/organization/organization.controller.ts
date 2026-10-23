import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';
import { DEFAULT_UPLOAD_LIMITS } from '@tamu-gisc/common/nest/services';

import { OrganizationService } from './organization.service';
import { Organization } from '../entities/all.entity';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get('season/active')
  public getActive() {
    return this.orgService.getOrganizationsForActiveSeason();
  }

  @Get('season/:guid')
  public getOrgsForSeason(@Param('guid') guid: string) {
    return this.orgService.getOrganizationsForSeason(guid);
  }

  @Get('active-events')
  public activeSeasonOrgs() {
    return this.orgService.getOrgsWithEvents();
  }

  @Get(':guid')
  public findOne(@Param('guid') guid: string) {
    return this.orgService.getOrganization(guid);
  }

  @Get()
  public findAll() {
    return this.orgService.getOrganizations();
  }

  @Permissions(['create:organizations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('clone')
  public copy(@Body('seasonGuid') seasonGuid: string, @Body('existingEntityGuids') existingEntityGuids: Array<string>) {
    return this.orgService.copyOrganizationsIntoSeason(seasonGuid, existingEntityGuids);
  }

  @Permissions(['create:organizations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { ...DEFAULT_UPLOAD_LIMITS } }))
  public create(@Body() creteOrgDto?: Partial<Organization>, @UploadedFile() file?: Express.Multer.File) {
    return this.orgService.createOrganization(creteOrgDto, file);
  }

  @Permissions(['update:organizations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  @UseInterceptors(FileInterceptor('file', { limits: { ...DEFAULT_UPLOAD_LIMITS } }))
  public update(
    @Param('guid') guid: string,
    @Body() updateOrgDto: Partial<Organization>,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.orgService.updateOrganization(guid, updateOrgDto, file);
  }

  @Permissions(['delete:organizations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public remove(@Param('guid') guid: string) {
    return this.orgService.deleteEntities(guid);
  }

  @Permissions(['delete:organizations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete()
  public removeMany(@Body('guid') guid: string) {
    return this.orgService.deleteEntities(guid);
  }
}
