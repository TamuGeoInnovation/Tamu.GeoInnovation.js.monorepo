import { Injectable } from '@nestjs/common';

import got from 'got';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

@Injectable()
export class MailerService {
  constructor(private readonly env: EnvironmentService) {}

  public sendMail(mailConfig: IMailroomEmailOutbound) {
    // TODO: Need the environment service to get the address of the mailroom-nest instance from environment file
    const mailroomUrl = this.env.value('mailroomUrl');
    return got
      .post(mailroomUrl, {
        json: mailConfig
      })
      .json();
  }
}
