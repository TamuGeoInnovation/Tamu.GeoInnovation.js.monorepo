import { Controller, Get } from '@nestjs/common';

@Controller('submission')
export class SubmissionController {
  constructor() {}

  @Get()
  public getServiceDetails() {
    console.log('getServiceDetails');
    return;
  }
}
