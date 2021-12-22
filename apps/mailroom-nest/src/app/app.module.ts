import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailroomEmail, MailroomAttachment, MailroomReject } from '@tamu-gisc/mailroom/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from '../environments/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...config, entities: [MailroomEmail, MailroomAttachment, MailroomReject] }),
    TypeOrmModule.forFeature([MailroomEmail, MailroomReject])
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
