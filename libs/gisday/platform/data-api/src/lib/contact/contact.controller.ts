import { Controller, Post, Body } from '@nestjs/common';

import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() message: IMailroomEmailOutbound) {
    return this.contactService.sendMessage(message);
  }
}
