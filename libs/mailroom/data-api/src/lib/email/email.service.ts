import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MailroomEmail } from '@tamu-gisc/mailroom/common';

@Injectable()
export class EmailService {
  constructor(@InjectRepository(MailroomEmail) private emailRepo: Repository<MailroomEmail>) {}

  public getAllEmails() {
    return this.emailRepo.find();
  }

  public getEmail(id: string) {
    return this.emailRepo.findOne({
      where: {
        id: parseInt(id, 10)
      },
      relations: ['attachments']
    });
  }

  public async deleteEmail(id: string) {
    const email = await this.emailRepo.findOne({
      where: {
        // Was `where: {}`, which matches every row. `findOne` then returned whichever one the
        // database ordered first, and that email was deleted instead of the requested one, with
        // its attachments cascading. The caller still got `true`, so it failed silently.
        id: parseInt(id, 10)
      },
      relations: ['attachments']
    });

    // `remove(undefined)` throws, so an id matching nothing surfaced as a 500 rather than as
    // "no such email".
    if (!email) {
      return false;
    }

    const removed = (await this.emailRepo.remove(email)) ? true : false;

    return removed;
  }
}
