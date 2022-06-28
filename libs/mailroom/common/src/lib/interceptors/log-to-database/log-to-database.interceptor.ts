import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { tap } from 'rxjs/operators';
import { Repository } from 'typeorm';

import { MailroomAttachment, MailroomEmail } from '../../entities/all.entities';
import { IMailroomEmailOutbound, ITamuRelayResponse } from '../../types/mail.types';

@Injectable()
export class LogToDatabaseInterceptor implements NestInterceptor {
  @InjectRepository(MailroomEmail)
  public repo: Repository<MailroomEmail>;

  @InjectRepository(MailroomAttachment)
  public attachmentsRepo: Repository<MailroomAttachment>;

  public intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      tap(async (value: { response: ITamuRelayResponse; email: IMailroomEmailOutbound }) => {
        const outbound = await this.repo
          .create({
            relayResponse: JSON.stringify(value.response),
            text: value.email.text,
            subject: value.email.subject,
            to: value.email.to,
            from: value.email.from
          })
          .save();

        if (value.email.attachments) {
          const attachments: Array<Express.Multer.File> = value.email.attachments;

          attachments.forEach((attachment) => {
            this.attachmentsRepo
              .create({
                email: outbound,
                mimeType: attachment.mimetype,
                blob: attachment.buffer
              })
              .save();
          });
        }
      })
    );
  }
}
