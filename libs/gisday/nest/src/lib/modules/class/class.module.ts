import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from '@tamu-gisc/gisday/nest';
import { ClassController } from '../../controllers/class/class.controller';
import { ClassProvider } from '../../providers/class/class.provider';

@Module({
  imports: [],
  controllers: [ClassController],
  providers: [ClassProvider],
  exports: []
})
export class ClassModule {}
