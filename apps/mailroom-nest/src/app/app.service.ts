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
          blob: file.buffer
        });
      });

      const email = getRepository(MailroomEmail).create({
        to: body.to,
        from: body.from,
        text: body.text,
        attachments
      });

      await email.save();
    } else {
      const email = getRepository(MailroomEmail).create({
        to: body.to,
        from: body.from,
        text: body.text
      });

      await email.save();
    }
  }
}
