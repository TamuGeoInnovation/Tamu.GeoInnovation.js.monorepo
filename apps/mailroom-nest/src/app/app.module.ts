import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailroomEmail, MailroomAttachment, MailroomReject } from '@tamu-gisc/mailroom/common';
import { Mailer } from '@tamu-gisc/oidc/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DB_CONFIG } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...DB_CONFIG, entities: [MailroomEmail, MailroomAttachment, MailroomReject] }),
    TypeOrmModule.forFeature([MailroomEmail, MailroomReject])
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
  constructor() {
    Mailer.build('tamu-relay');
  }
}
