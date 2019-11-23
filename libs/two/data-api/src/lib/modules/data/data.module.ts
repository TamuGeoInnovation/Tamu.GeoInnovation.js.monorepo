import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeatherFlux } from '@tamu-gisc/two/common';

@Module({
  imports: [TypeOrmModule.forFeature([WeatherFlux])],
  controllers: [DataController],
  providers: [DataService]
})
export class DataModule {}
