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
      relations: ['season']
    });
  }

  @Get()
  public findAll() {
    return this.orgService.find({
      relations: ['season']
    });
  }

  @Permissions(['create:organizations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  public create(@Body() creteOrgDto?: Partial<Organization>, @UploadedFile() file?) {
    return this.orgService.create(creteOrgDto);
  }

  @Permissions(['update:organizations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':guid')
  public update(@Param('guid') guid: string, @Body() updateOrgDto: Partial<Organization>, @UploadedFile() file?) {
    return this.orgService.update(guid, updateOrgDto);
  }

  @Permissions(['delete:organizations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public remove(@Param('guid') guid: string) {
    return this.orgService.deleteEntity(guid);
  }
}
