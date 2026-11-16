import { Module } from '@nestjs/common';

import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { EmailSenderController } from './email-sender.controller';
import { EmailSenderService } from './email-sender.service';

@Module({
  // The "Send as" choices (#3100) sit beside the contact form: both are about who an email is from.
  controllers: [ContactController, EmailSenderController],
  providers: [ContactService, EmailSenderService]
})
export class ContactModule {}
