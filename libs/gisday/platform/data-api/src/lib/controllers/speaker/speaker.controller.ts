import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { DeepPartial } from 'typeorm';

import { Speaker } from '../../entities/all.entity';
import { SpeakerProvider } from '../../providers/speaker/speaker.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('speaker')
export class SpeakerController extends BaseController<Speaker> {
  constructor(private readonly speakerProvider: SpeakerProvider) {
    super(speakerProvider, 'speaker');
  }

  @Get('/presenter/:guid')
  public async presenter(@Param() params) {
    return this.speakerProvider.getPresenter(params.guid);
  }

  @Get('/presenters')
  public async presenters() {
    return this.speakerProvider.getPresenters();
  }

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  public async speakerAndInfo(@Body() body, @UploadedFile() file) {
    const _speaker: DeepPartial<Speaker> = body;
    return this.speakerProvider.insertWithInfo(_speaker, file);
  }

  @Get('/photo/:guid')
  public async getSpeakerPhoto(@Param() params) {
    return this.speakerProvider.getSpeakerPhoto(params.guid);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  public async updateSpeakerInfo(@Body() body: DeepPartial<Speaker>, @UploadedFile() file) {
    return this.speakerProvider.updateWithInfo(body, file);
  }
}
