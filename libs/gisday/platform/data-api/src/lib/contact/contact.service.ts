import { Injectable, InternalServerErrorException } from '@nestjs/common';

import got from 'got';

import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

@Injectable()
export class ContactService {
  public sendMessage(message: IMailroomEmailOutbound) {
    const composed = { ...message };

    composed.to = process.env.MAILROOM_TO;
    composed.from = process.env.MAILROOM_FROM;
    composed.replyTo = message.from;

    return got
      .post(process.env.MAILROOM_URL, {
        json: composed
      })
      .json()
      .catch((e) => {
        throw new InternalServerErrorException(e, 'Error sending email.');
      });
  }
}
