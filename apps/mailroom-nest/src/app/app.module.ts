import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailroomEmail, MailroomAttachment, MailroomReject } from '@tamu-gisc/mailroom/common';
import { EmailModule } from '@tamu-gisc/mailroom/data-api';

import { ormConfig } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: ormConfig.type as any,
      host: ormConfig.host,
      username: ormConfig.username,
      password: ormConfig.password,
      database: ormConfig.database,
      synchronize: ormConfig.synchronize,
      dropSchema: ormConfig.dropSchema,
      logging: ormConfig.logging,
      extra: ormConfig.extra,
      entities: [MailroomEmail, MailroomAttachment, MailroomReject]
    }),
    EmailModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
