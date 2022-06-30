import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MailroomAttachment, MailroomEmail, MailroomReject } from '@tamu-gisc/mailroom/common';

@Injectable()
export class AppService {
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
}
