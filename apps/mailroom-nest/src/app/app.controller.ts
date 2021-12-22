import { Controller, Get } from '@nestjs/common';
import { Mailer } from '@tamu-gisc/oidc/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('/mail-test')
  getMail() {
    return Mailer.sendPasswordResetConfirmationEmail('aplecore@gmail.com');
  }
}
