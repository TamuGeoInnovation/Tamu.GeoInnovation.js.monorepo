import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailroomEmail, MailroomAttachment, MailroomReject } from '@tamu-gisc/mailroom/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DB_CONFIG } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...DB_CONFIG, entities: [MailroomEmail, MailroomAttachment, MailroomReject] }),
    TypeOrmModule.forFeature([MailroomEmail, MailroomAttachment, MailroomReject])
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
