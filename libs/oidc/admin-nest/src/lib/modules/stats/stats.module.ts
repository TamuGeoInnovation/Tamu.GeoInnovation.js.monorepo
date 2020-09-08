import { Module } from '@nestjs/common';
import { StatsController } from '../../controllers/stats/stats.controller';
import { StatService } from '../../services/stats/stats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenRepo, UserRepo } from '../../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccessTokenRepo, UserRepo])],
  providers: [StatService],
  controllers: [StatsController],
  exports: [StatService]
})
export class StatsModule {}
