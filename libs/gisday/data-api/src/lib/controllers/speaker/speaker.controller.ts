import { Controller, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeepPartial } from 'typeorm';

import { Request } from 'express';

import { Speaker } from '../../entities/all.entity';
import { SpeakerProvider } from '../../providers/speaker/speaker.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('speaker')
export class SpeakerController extends BaseController<Speaker> {
  constructor(private readonly speakerProvider: SpeakerProvider) {
    super(speakerProvider);
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
  public async speakerAndInfo(@Req() req: Request, @UploadedFile() file) {
    // TODO: Fix this, its a pain-in-the-ass -Aaron (1/5/2021)
    const _speaker: DeepPartial<Speaker> = req.body;
    return this.speakerProvider.insertWithInfo(_speaker, file);
  }

  @Get('/photo/:guid')
  public async getSpeakerPhoto(@Param() params) {
    return this.speakerProvider.getSpeakerPhoto(params.guid);
  }

  @Patch('/info')
  public async updateSpeakerInfo(@Req() req: Request) {
    return this.speakerProvider.updateSpeakerInfo(req);
  }
}
