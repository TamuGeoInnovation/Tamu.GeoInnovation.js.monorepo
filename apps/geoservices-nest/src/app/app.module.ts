import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GeoservicesDataApiModule, Payment, User } from '@tamu-gisc/geoservices/data-api';
import { EnvironmentModule } from '@tamu-gisc/common/nest/environment';

import { environment, ormConfig } from '../environments/environment';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: ormConfig.type as any,
      host: ormConfig.host,
      username: ormConfig.username,
      password: ormConfig.password,
      database: ormConfig.database,
      synchronize: ormConfig.synchronize,
      dropSchema: ormConfig.dropSchema,
      logging: ormConfig.logging,
      extra: ormConfig.extra,
      entities: [Payment, User]
    }),
    EnvironmentModule.forRoot(environment),
    GeoservicesDataApiModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
