import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeatherfluxExpanded } from '@tamu-gisc/two/common';

@Module({
  imports: [TypeOrmModule.forFeature([WeatherfluxExpanded])],
  controllers: [DataController],
  providers: [DataService]
})
export class DataModule {}
