import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataTask, Token } from '@tamu-gisc/veoride/common/entities';
import { VeorideDataApiModule } from '@tamu-gisc/veoride/data-api';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { dbConfig } from '../environments/environment';

@Module({
  imports: [TypeOrmModule.forRoot({ ...dbConfig, entities: [DataTask, Token] }), VeorideDataApiModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
