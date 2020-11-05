import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniversityController } from '../../controllers/university/university.controller';
import { UniversityRepo } from '../../entities/all.entity';
import { UniversityProvider } from '../../providers/university/university.provider';

@Module({
  imports: [TypeOrmModule.forFeature([UniversityRepo])],
  exports: [],
  controllers: [UniversityController],
  providers: [UniversityProvider]
})
export class UniversityModule {}
