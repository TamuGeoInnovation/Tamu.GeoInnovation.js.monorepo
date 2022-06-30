import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { tap } from 'rxjs/operators';
import { Repository } from 'typeorm';

import { MailroomAttachment, MailroomEmail } from '../../entities/all.entities';
import { EmailStatus, IMailroomEmailOutbound, ITamuRelayResponse } from '../../types/mail.types';

@Injectable()
export class LogToDatabaseInterceptor implements NestInterceptor {
  @InjectRepository(MailroomEmail)
  public repo: Repository<MailroomEmail>;

  @InjectRepository(MailroomAttachment)
  public attachmentsRepo: Repository<MailroomAttachment>;

  public intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      tap(async (value: { response: ITamuRelayResponse; email: IMailroomEmailOutbound }) => {
        // create a save the email / relay response to db
        const outbound = await this.repo
          .create({
            relayResponse: JSON.stringify(value.response),
            text: value.email.text,
            subject: value.email.subject,
            to: value.email.to,
            from: value.email.from,
            deliveryStatus: value.response.accepted.length > 0 ? EmailStatus.Accepted : EmailStatus.Rejected
          })
          .save();

        // if attachments are present, save each one to the db
        if (value.email.attachments) {
          const attachments: Array<Express.Multer.File> = value.email.attachments;

          const attachmentEntities = attachments.map((attachment) => {
            return this.attachmentsRepo
              .create({
                email: outbound,
                mimeType: attachment.mimetype,
                blob: attachment.buffer
              })
              .save();
          });

          Promise.allSettled(attachmentEntities);
        }
      })
    );
  }
}
