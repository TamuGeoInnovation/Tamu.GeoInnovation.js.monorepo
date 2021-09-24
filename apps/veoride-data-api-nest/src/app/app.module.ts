import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataTask, Token } from '@tamu-gisc/veoride/common/entities';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { dbConfig } from '../environments/environment';

@Module({
  imports: [TypeOrmModule.forRoot({ ...dbConfig, entities: [DataTask, Token] })],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
