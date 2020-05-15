import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';

import { AppService } from './app.service';

import { FileAccessPipe, IrgasonValidationService } from '@tamu-gisc/two/valup';

@Controller()
export class AppController {
  constructor(private readonly irgasonService: IrgasonValidationService) {}

  @Post()
  @UsePipes(FileAccessPipe)
  public whatsTheFileName(@Body('path') path: string) {
    this.irgasonService.validateAndUpload(path);
  }

}
