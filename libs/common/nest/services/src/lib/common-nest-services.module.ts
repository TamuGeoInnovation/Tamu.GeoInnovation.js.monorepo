import { Module } from '@nestjs/common';

import { MailerService } from './mailer/mailer.service';

@Module({
  controllers: [],
  providers: [MailerService],
  exports: [MailerService]
})
export class CommonNestServicesModule {}
