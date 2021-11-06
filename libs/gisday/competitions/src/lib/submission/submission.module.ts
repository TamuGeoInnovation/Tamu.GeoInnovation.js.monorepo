import { Module } from '@nestjs/common';

import { ArcServerModule } from '../arc-server/arc-server.module';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';

@Module({
  imports: [ArcServerModule],
  controllers: [SubmissionController],
  providers: [SubmissionService]
})
export class SubmissionModule {}
