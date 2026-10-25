import { GatewayTimeoutException, Injectable, InternalServerErrorException } from '@nestjs/common';

import got from 'got';

import { isMailroomTimeout, mailroomRequestOptions } from '@tamu-gisc/common/nest/services';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

@Injectable()
export class ContactService {
  public sendMessage(message: IMailroomEmailOutbound, systemCall = false) {
    const composed = { ...message };

    composed.to = systemCall && message.to ? message.to : process.env.MAILROOM_TO;
    composed.from = systemCall && message.from ? message.from : process.env.MAILROOM_FROM;
    composed.bcc = systemCall && message.bcc ? message.bcc : process.env.MAILROOM_BCC;
    composed.cc = systemCall && message.cc ? message.cc : process.env.MAILROOM_CC;
    composed.replyTo = systemCall && message.replyTo ? message.replyTo : message.from;

    return got
      .post(process.env.MAILROOM_URL, {
        json: composed,
        ...mailroomRequestOptions()
      })
      .json()
      .catch((e) => {
        // A mailroom that never answers is a 504, not a request held open for ever (#2277).
        if (isMailroomTimeout(e)) {
          throw new GatewayTimeoutException('Mailroom did not answer in time.');
        }

        throw new InternalServerErrorException(e, 'Error sending email.');
      });
  }
}
