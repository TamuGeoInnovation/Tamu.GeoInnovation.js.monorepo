import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeepPartial } from 'typeorm';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { EntityRelationsLUT, Speaker } from '../entities/all.entity';
import { SpeakerProvider } from './speaker.provider';

@Controller('speakers')
export class SpeakerController {
  constructor(private readonly provider: SpeakerProvider) {}

  @Get('/presenter/:guid')
  public async presenter(@Param() params) {
    return this.provider.getPresenter(params.guid);
  }

  @Get(':guid/speaker')
  public async getEntityWithRelations(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      },
      relations: EntityRelationsLUT.getRelation('speaker')
    });
  }

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      },
      relations: ['organization', 'university', 'image']
    });
  }

  @Get()
  public async getEntities() {
    return this.provider.find({
      relations: ['organization', 'university', 'image'],
      order: {
        lastName: 'ASC'
      }
    });
  }

  @Permissions(['create:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  public async speakerAndInfo(@Body() body, @UploadedFile() file) {
    const _speaker: DeepPartial<Speaker> = body;
    return this.provider.insertWithInfo(_speaker, file);
  }

  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  @UseInterceptors(FileInterceptor('file'))
  public async updateSpeakerInfo(@Param('guid') guid: string, @Body() body: DeepPartial<Speaker>, @UploadedFile() file) {
    return this.provider.updateWithInfo(guid, body, file);
  }

  @Permissions(['delete:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    return this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
