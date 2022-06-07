import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { getRepository, Repository } from 'typeorm';

import { IMailroomEmailOutbound, MailroomAttachment, MailroomEmail } from '@tamu-gisc/mailroom/common';

@Injectable()
export class AppService {
  constructor(@InjectRepository(MailroomEmail) private repo: Repository<MailroomEmail>) {}

  public getData() {
    return 200;
  }

  public async insertMailroomEmail(body: IMailroomEmailOutbound, files?: Express.Multer.File[]) {
    if (files) {
      const attachments: Partial<MailroomAttachment>[] = files.map((file) => {
        return getRepository(MailroomAttachment).create({
          blob: file
        });
      });

      const email = getRepository(MailroomEmail).create({
        from: body.recipientEmail,
        content: body.emailBodyText,
        attachments
      });

      await email.save();
    } else {
      const email = getRepository(MailroomEmail).create({
        from: body.recipientEmail,
        content: body.emailBodyText
      });

      await email.save();
    }
  }
}
