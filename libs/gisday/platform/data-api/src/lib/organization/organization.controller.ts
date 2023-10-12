import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { OrganizationService } from './organization.service';
import { Organization } from '../entities/all.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get(':guid')
  public findOne(@Param('guid') guid: string) {
    return this.orgService.findOne({
      where: {
        guid
      },
      relations: ['season', 'logo']
    });
  }

  @Get()
  public findAll() {
    return this.orgService.find({
      relations: ['season', 'logo']
    });
  }

  @Permissions(['create:organizations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  public create(@Body() creteOrgDto?: Partial<Organization>, @UploadedFile() file?: Express.Multer.File) {
    return this.orgService.createOrganization(creteOrgDto, file);
  }

  @Permissions(['update:organizations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  @UseInterceptors(FileInterceptor('file'))
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
    return this.orgService.deleteEntity(guid);
  }
}
