import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';

import { MailroomReject } from '../entities/all.entities';

@Catch()
export class NoRecipientFilter implements ExceptionFilter {
  @InjectRepository(MailroomReject)
  public repo: Repository<MailroomReject>;

  public catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorMessage = 'No recipient provided';

    const reject: Partial<MailroomReject> = {
      reason: exception.message
    };
    this.repo.create(reject).save();

    response.json({
      timestamp: new Date().toISOString(),
      errorMessage
    });
  }
}
