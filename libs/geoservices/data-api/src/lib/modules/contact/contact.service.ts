import { Injectable } from '@nestjs/common';

import { MailerService, TurnstileVerifyService } from '@tamu-gisc/common/nest/services';

import { IsEmail, IsNotEmpty } from 'class-validator';
@Injectable()
export class ContactService {
  constructor(private readonly ms: MailerService, private readonly ts: TurnstileVerifyService) {}

  public async sendMessage(body: ContactMessageDto) {
    if (!body.token) {
      return;
    }

    // Verify the token
    const verified = await this.ts.verify(body.token);

    if (!verified) {
      return;
    }

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

  public token: string;
}
