import { GatewayTimeoutException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import got from 'got';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

import { isMailroomTimeout, mailroomRequestOptions } from '../mailroom-timeout';

@Injectable()
export class MailerService {
  constructor(private readonly env: EnvironmentService) {}

  public async sendMail(mailConfig: IMailroomEmailOutbound) {
    // Get mailroom server url and the from address for this app from env file
    const mailroomUrl = this.env.value('mailroomUrl');
    const fromAddress = this.env.value('mailroomFromAddress');

    // If we have a from address, set the from email address to that value
    if (fromAddress) {
      mailConfig.from = fromAddress;
    }

    return got
      .post(mailroomUrl, {
        json: mailConfig,
        ...mailroomRequestOptions()
      })
      .json()
      .catch((e) => {
        Logger.error('Failed to send email: ' + e.message, 'MailerService');

        // A mailroom that never answers is a 504, not a request held open for ever (#2277).
        if (isMailroomTimeout(e)) {
          throw new GatewayTimeoutException('Mailroom did not answer in time');
        }

        throw new InternalServerErrorException('Could not send email');
      });
  }
}
