import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';

import { MailroomReject } from '../entities/all.entities';

@Catch()
export class MailroomExceptionFilter implements ExceptionFilter {
  @InjectRepository(MailroomReject)
  public repo: Repository<MailroomReject>;

  public catch(exception: HttpException, host: ArgumentsHost) {
    console.log('MailroomExceptionFilter');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const reject: Partial<MailroomReject> = {
      reason: exception.message
    };
    this.repo.create(reject).save();

    response.json({
      timestamp: new Date().toISOString(),
      exception: exception.message
    });
  }
}
