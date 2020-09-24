import { Controller, Get, Param, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Speaker, SpeakerPhoto } from '../../entities/all.entity';
import { SpeakerProvider } from '../../providers/speaker/speaker.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('speaker')
export class SpeakerController extends BaseController<Speaker> {
  constructor(private readonly speakerProvider: SpeakerProvider) {
    super(speakerProvider);
  }

  // @Get('/:guid')
  // async speakerWithPhoto(@Param() params) {
  //   console.log('speakerWithPhoto');
  //   const photo: SpeakerPhoto = await this.speakerProvider.speakerPhotoRepo.findOne({
  //     where: {
  //       speakerGuid: params.guid
  //     }
  //   });
  //   if (photo) {
  //     const base64 = photo.blob.toString('base64');
  //     return base64;
  //   } else {
  //     return "Could not find speaker's photo";
  //   }
  // }

  @Post('/photo/:guid')
  @UseInterceptors(FileInterceptor('file'))
  async speakerPhoto(@Param() params, @UploadedFile() file) {
    const speakerGuid = params.guid;
    console.log(speakerGuid, file);
    return this.speakerProvider.insertPhoto(speakerGuid, file);
  }
}
