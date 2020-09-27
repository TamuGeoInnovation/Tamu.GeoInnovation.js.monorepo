import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseCreditController } from '../../controllers/course-credit/course-credit.controller';
import { CourseCreditProvider } from '../../providers/course-credit/course-credit.provider';
import { CourseCreditRepo } from '../../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseCreditRepo])],
  controllers: [CourseCreditController],
  providers: [CourseCreditProvider]
})
export class CourseCreditModule {}
