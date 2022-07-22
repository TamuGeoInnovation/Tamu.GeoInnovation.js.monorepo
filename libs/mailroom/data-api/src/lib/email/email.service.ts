import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MailroomAttachment, MailroomEmail, MailroomReject } from '@tamu-gisc/mailroom/common';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(MailroomEmail) private emailRepo: Repository<MailroomEmail>,
    @InjectRepository(MailroomAttachment) private attachmentRepo: Repository<MailroomAttachment>,
    @InjectRepository(MailroomReject) private rejectRepo: Repository<MailroomReject>
  ) {}

  public getAllEmails() {
    return this.emailRepo.find();
  }

  public getEmail(id: string) {
    return this.emailRepo.findOne({
      where: {
        id
      },
      relations: ['attachments']
    });
  }

  public async deleteEmail(id: string) {
    const email = await this.emailRepo.findOne(id, {
      relations: ['attachments']
    });

    return this.emailRepo.remove(email);
  }
}
