import { Body, Controller, Post } from '@nestjs/common';

import { ContactMessageDto, ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly cs: ContactService) {}

  @Post()
  public sendMessage(@Body() body: ContactMessageDto) {
    return { payload: JSON.stringify(body) };
  }
}
