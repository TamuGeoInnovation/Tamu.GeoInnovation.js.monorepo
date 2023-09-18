import {
  Body,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { DeepPartial } from 'typeorm';

import { EntityRelationsLUT, Speaker } from '../entities/all.entity';
import { SpeakerProvider } from './speaker.provider';

@Controller('speakers')
export class SpeakerController {
  constructor(private readonly provider: SpeakerProvider) {}

  @Get('/presenter/:guid')
  public async presenter(@Param() params) {
    return this.provider.getPresenter(params.guid);
  }

  @Get('/photo/:guid')
  public async getSpeakerPhoto(@Param() params) {
    return this.provider.getSpeakerPhoto(params.guid);
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

  @Get('/presenters')
  public async presenters() {
    return this.provider.getPresenters();
  }

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

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  public async speakerAndInfo(@Body() body, @UploadedFile() file) {
    const _speaker: DeepPartial<Speaker> = body;
    return this.provider.insertWithInfo(_speaker, file);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  public async updateSpeakerInfo(@Body() body: DeepPartial<Speaker>, @UploadedFile() file) {
    return this.provider.updateWithInfo(body, file);
  }

  @Delete(':guid')
  public async deleteEntity(@Param() params) {
    throw new NotImplementedException();
  }
}
