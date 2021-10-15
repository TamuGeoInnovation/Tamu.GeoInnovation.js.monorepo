import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Observable, pipe } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Repository } from 'typeorm';

import { MailroomEmail } from '../../entities/all.entities';
import { EmailStatus } from '../../types/mail.types';

@Injectable()
export class LogToDatabaseInterceptor implements NestInterceptor {
  @InjectRepository(MailroomEmail)
  public repo: Repository<MailroomEmail>;

  public intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    console.log('LogToDatabaseInterceptor', request.body);

    // Hasn't been through the pipe to transform request into MailroomOutbound
    // const email: Partial<MailroomEmail> = {
    //   content: 'Joe mamma',
    //   from: 'joemamma@gmail.com',
    //   deliveryStatus: EmailStatus.Accepted
    // };
    // this.repo.create(email).save();

    return next.handle().pipe(
      tap((response) => {
        // response here contains a MailroomOutbout object (or should)
        // const email: Partial<MailroomEmail> = {
        //   content: 'Joe mamma',
        //   from: 'joemamma@gmail.com',
        //   deliveryStatus: EmailStatus.Accepted
        // };
        // this.repo.create(email).save();
        console.log('LogToDatabaseInterceptor inside of the handle observable', response);
      })
    );
  }
}
