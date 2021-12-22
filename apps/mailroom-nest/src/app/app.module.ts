import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailroomEmail, MailroomAttachment } from '@tamu-gisc/mailroom/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from '../environments/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...config, entities: [MailroomEmail, MailroomAttachment] }),
    TypeOrmModule.forFeature([MailroomEmail])
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
