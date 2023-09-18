import { Column, ManyToOne } from 'typeorm';
import { GuidIdentity } from '../../entities/all.entity';
import { Season } from '../../season/entities/season.entity';

export class SeasonDay extends GuidIdentity {
  @Column({ nullable: false })
  date: Date;

  // Season day belongs to a season
  @ManyToOne(() => Season, (season) => season.days)
  season: Season;
}
