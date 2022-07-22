import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailroomEmail, MailroomAttachment, MailroomReject } from '@tamu-gisc/mailroom/common';
import { EmailModule } from '@tamu-gisc/mailroom/data-api';

import { DB_CONFIG } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...DB_CONFIG, entities: [MailroomEmail, MailroomAttachment, MailroomReject] }),
    EmailModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
