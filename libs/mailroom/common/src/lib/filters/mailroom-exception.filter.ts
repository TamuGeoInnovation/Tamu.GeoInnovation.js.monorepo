import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Response } from 'express';
import { Repository } from 'typeorm';

import { MailroomReject } from '../entities/all.entities';

/**
 * MailroomExceptionFilter handles errors that pop up in the proces of sending an email.
 * These errors are then logged in a database under the table `rejects`.
 * Note that this filter is applied on routes at the moment and not at the controller level.
 */
@Catch()
export class MailroomExceptionFilter implements ExceptionFilter {
  @InjectRepository(MailroomReject)
  public repo: Repository<MailroomReject>;

  public catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.repo
      .create({
        reason: exception.message
      })
      .save();

    response.json({
      timestamp: new Date().toISOString(),
      exception: exception.message
    });
  }
}
