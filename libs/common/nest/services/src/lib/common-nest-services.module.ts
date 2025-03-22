import { Module } from '@nestjs/common';

import { MailerService } from './mailer/mailer.service';
import { TurnstileVerifyService } from './turnstile-verify/turnstile-verify.service';

@Module({
  controllers: [],
  providers: [MailerService, TurnstileVerifyService],
  exports: [MailerService, TurnstileVerifyService]
})
export class CommonNestServicesModule {}
