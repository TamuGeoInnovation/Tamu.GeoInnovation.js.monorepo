import { Controller, Delete, Get, NotImplementedException, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { QuestionTypeProvider } from './question-type.provider';

/**
 * Question types are written only by an admin who can add or remove accounts (#3668): no other admin permission covers
 * them, and these two are ones admins already hold, so nothing changes in Auth0. Reading them stays open.
 */
@Controller('question-types')
export class QuestionTypeController {
  constructor(private readonly provider: QuestionTypeProvider) {}

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Get()
  public async getEntities() {
    return this.provider.find();
  }

  @Permissions(['create:users'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEntity() {
    throw new NotImplementedException();
  }

  @Permissions(['create:users'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public async updateEntity() {
    throw new NotImplementedException();
  }

  @Permissions(['delete:users'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
