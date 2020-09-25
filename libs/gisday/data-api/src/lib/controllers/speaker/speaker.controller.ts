import { Controller, Get, Param, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Speaker, SpeakerInfo } from '../../entities/all.entity';
import { SpeakerProvider } from '../../providers/speaker/speaker.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('speaker')
export class SpeakerController extends BaseController<Speaker> {
  constructor(private readonly speakerProvider: SpeakerProvider) {
    super(speakerProvider);
  }

  @Get('/presenters')
  async presenters() {
    return this.speakerProvider.getPresenters();
  }

  @Post('/photo')
  @UseInterceptors(FileInterceptor('file'))
  async speakerPhoto(@Req() req: Request, @UploadedFile() file) {
    const speakerGuid = req.body.speakerGuid;
    return this.speakerProvider.insertPhoto(speakerGuid, req, file);
  }
}
