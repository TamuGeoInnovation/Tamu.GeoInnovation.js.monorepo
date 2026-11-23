import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Season, SeasonWinner, Submission } from '../entities/all.entity';
import { SeasonWinnerController } from './season-winner.controller';
import { SeasonWinnerService } from './season-winner.service';

/** A season's winners, picked by the admins and shown on the homepage (#3239). */
@Module({
  imports: [TypeOrmModule.forFeature([SeasonWinner, Season, Submission])],
  controllers: [SeasonWinnerController],
  providers: [SeasonWinnerService]
})
export class SeasonWinnerModule {}
