import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { tap } from 'rxjs/operators';
import { Repository } from 'typeorm';

import { MailroomEmail } from '../../entities/all.entities';
import { ITamuRelayResponse } from '../../types/mail.types';

@Injectable()
export class LogToDatabaseInterceptor implements NestInterceptor {
  @InjectRepository(MailroomEmail)
  public repo: Repository<MailroomEmail>;

  public intercept(context: ExecutionContext, next: CallHandler) {
    // const request = context.switchToHttp().getRequest();
    // console.log('LogToDatabaseInterceptor', request.body);

    // Hasn't been through the pipe to transform request into MailroomOutbound
    // const email: Partial<MailroomEmail> = {
    //   content: 'Joe mamma',
    //   from: 'joemamma@gmail.com',
    //   deliveryStatus: EmailStatus.Accepted
    // };
    // this.repo.create(email).save();

    return next.handle().pipe(
      tap((response: ITamuRelayResponse) => {
        // response here contains a MailroomOutbout object
        // Many different ways to check
        // const email: Partial<MailroomEmail> = {
        //   content: 'Joe mamma',
        //   from: 'joemamma@gmail.com',
        //   deliveryStatus: EmailStatus.Accepted
        // };
        // this.repo.create(email).save();
        // {
        //   accepted: [ 'aplecore@gmail.com' ],
        //   rejected: [],
        //   envelopeTime: 284,
        //   messageTime: 374,
        //   messageSize: 614,
        //   response: '250 2.0.0 3gmmve69kt-1 Message accepted for delivery',
        //   envelope: { from: 'giscaccounts@tamu.edu', to: [ 'aplecore@gmail.com' ] },
        //   messageId: '<b52abe95-833d-22d1-edb0-a89e77041323@tamu.edu>'
        // }
        // console.log(response);
        // if (response.rejected.length > 0) {
        //   console.warn('Rejected', response.rejected);
        // }
        // if (response.accepted.length > 0) {
        //   console.log('Accepted');
        // }

        this.repo.create({});

        // console.log('LogToDatabaseInterceptor inside of the handle observable', response);
      })
    );
  }
}
