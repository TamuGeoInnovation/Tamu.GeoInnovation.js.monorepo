import { GatewayTimeoutException, Injectable, InternalServerErrorException } from '@nestjs/common';

import got from 'got';

import { isMailroomTimeout, mailroomRequestOptions } from '@tamu-gisc/common/nest/services';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

/**
 * An email as the API hands it to the mailroom. `to` and `from` may be empty: a system send without them, and every other
 * send, takes them from `MAILROOM_TO` and `MAILROOM_FROM`, and with those unset the mailroom gets none, as it always has.
 */
export type OutgoingEmail = Omit<IMailroomEmailOutbound, 'to' | 'from'> & { to?: string; from?: string };

@Injectable()
export class ContactService {
  public sendMessage(message: OutgoingEmail, systemCall = false) {
    const composed = { ...message };
    const url = process.env.MAILROOM_URL;

    // Refused as got refuses a request with no address, as a rejected promise; this one says why.
    if (!url) {
      return Promise.reject(new InternalServerErrorException('MAILROOM_URL is not set.', 'Error sending email.'));
    }

    composed.to = systemCall && message.to ? message.to : process.env.MAILROOM_TO;
    composed.from = systemCall && message.from ? message.from : process.env.MAILROOM_FROM;
    composed.bcc = systemCall && message.bcc ? message.bcc : process.env.MAILROOM_BCC;
    composed.cc = systemCall && message.cc ? message.cc : process.env.MAILROOM_CC;
    composed.replyTo = systemCall && message.replyTo ? message.replyTo : message.from;

    return got
      .post(url, {
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
