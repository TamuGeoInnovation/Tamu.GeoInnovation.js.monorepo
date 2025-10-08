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
      where: {},
      relations: ['attachments']
    });

    const removed = (await this.emailRepo.remove(email)) ? true : false;

    return removed;
  }
}
