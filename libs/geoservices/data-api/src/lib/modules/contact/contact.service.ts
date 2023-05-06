import { Injectable } from '@nestjs/common';

import { MailerService } from '@tamu-gisc/common/nest/services';

import { IsEmail, IsNotEmpty } from 'class-validator';
@Injectable()
export class ContactService {
  constructor(private readonly ms: MailerService) {}

  public sendMessage(body: ContactMessageDto) {
    return this.ms.sendMail({
      from: undefined,
      to: body.from,
      subject: body.subject,
      text: body.text
    });
  }
}

export class ContactMessageDto {
  @IsEmail()
  public from: string;

  @IsNotEmpty()
  public subject: string;

  @IsNotEmpty()
  public text: string;
}
