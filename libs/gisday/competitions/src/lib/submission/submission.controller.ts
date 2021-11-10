import { Body, Controller, Get, Post } from '@nestjs/common';
import { CompetitionSubmission } from '@tamu-gisc/gisday/common';

import { BaseController } from '../_base/base.controller';
import { SubmissionService } from './submission.service';
@Controller('submission')
export class SubmissionController extends BaseController<CompetitionSubmission> {
  constructor(private service: SubmissionService) {
    super(service);
  }

  @Post()
  public insert(@Body() body) {
    const sub = {
      value: JSON.stringify(body),
      userGuid: body.userGuid,
      location: body.location
    };
    return this.service.createOne(sub);
  }
}
