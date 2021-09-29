import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { DataTask, StatusChange, Token, Trip } from '@tamu-gisc/veoride/common/entities';
import { VeorideDataApiModule } from '@tamu-gisc/veoride/data-api';
import { QueryParamGuard } from '@tamu-gisc/common/nest/guards';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { dbConfig, jwtSecret } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...dbConfig, entities: [DataTask, Token, Trip, StatusChange] }),
    VeorideDataApiModule.register({ jwt: { secret: jwtSecret } })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: QueryParamGuard
    }
  ]
})
export class AppModule {}
