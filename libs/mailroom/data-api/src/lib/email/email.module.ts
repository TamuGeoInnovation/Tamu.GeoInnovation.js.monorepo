import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailroomEmail, MailroomAttachment, MailroomReject } from '@tamu-gisc/mailroom/common';

import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [TypeOrmModule.forFeature([MailroomEmail, MailroomAttachment, MailroomReject])],
  controllers: [EmailController],
  providers: [EmailService],
  exports: []
})
export class EmailModule {}
