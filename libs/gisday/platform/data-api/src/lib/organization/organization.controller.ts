import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { OrganizationService } from './organization.service';
import { Organization } from '../entities/all.entity';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get(':guid')
  public findOne(@Param('guid') guid: string) {
    return this.orgService.findOne({
      relations: ['season']
    });
  }

  @Get()
  public findAll() {
    return this.orgService.find({
      relations: ['season']
    });
  }

  @Post()
  public create(@Body() creteOrgDto?: Partial<Organization>) {
    return this.orgService.create(creteOrgDto);
  }

  @Patch(':guid')
  public update(@Param('guid') guid: string, @Body() updateOrgDto: Partial<Organization>) {
    return this.orgService.update(guid, updateOrgDto);
  }

  @Delete(':guid')
  public remove(@Param('guid') guid: string) {
    return this.orgService.deleteEntity(guid);
  }
}
