import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { map } from 'rxjs/operators';
import { Repository } from 'typeorm';

import { MailroomEmail } from '../../entities/all.entities';
import { EmailStatus } from '../../types/mail.types';

@Injectable()
export class LogToDatabaseInterceptor implements NestInterceptor {
  @InjectRepository(MailroomEmail)
  public repo: Repository<MailroomEmail>;

  public async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    // Inserts new email record into the database
    const email: Partial<MailroomEmail> = {
      content: JSON.stringify(request.body),
      from: request.body.recipientEmail,
      deliveryStatus: EmailStatus.InTransit
    };
    const _email = await this.repo.create(email).save();
    request.body.emailGuid = _email.guid;

    return next.handle().pipe(
      // This is capturing the outbound response
      map((response) => {
        let deliveryStatus = EmailStatus.InTransit;

        if (response.emailServer.accepted.length > 0) {
          deliveryStatus = EmailStatus.Accepted;
        } else if (response.emailServer.rejected.length > 0) {
          deliveryStatus = EmailStatus.Rejected;
        }

        // Find the previously inserted email record and set the DeliveryStatus accordingly
        this.repo
          .findOne({
            where: {
              guid: response.emailGuid
            }
          })
          .then((sentEmail) => {
            // update EmailStatus to delivered
            sentEmail.deliveryStatus = deliveryStatus;
            sentEmail.save();
          });

        return response.emailServer;
      })
    );
  }
}
