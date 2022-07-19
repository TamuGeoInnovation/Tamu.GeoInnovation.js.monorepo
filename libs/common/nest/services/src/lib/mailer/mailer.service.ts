import { Injectable } from '@nestjs/common';

import got from 'got';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

@Injectable()
export class MailerService {
  constructor(private readonly env: EnvironmentService) {}

  public async sendMail(mailConfig: IMailroomEmailOutbound) {
    const mailroomUrl = this.env.value('mailroomUrl');

    return got
      .post(mailroomUrl, {
        json: mailConfig
      })
      .json()
      .catch((e) => {
        console.warn('ERROR CANNOT CONNECT TO MAILROOM', e.code);
      });
  }
}
