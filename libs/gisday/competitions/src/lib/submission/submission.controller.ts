import { Controller, Get } from '@nestjs/common';
import { ArcServerService } from '../arc-server/arc-server.service';

@Controller('submission')
export class SubmissionController {
  constructor(private arcService: ArcServerService) {}

  @Get()
  public getServiceDetails() {
    console.log('getServiceDetails');
    return this.arcService.getService();
  }
}
