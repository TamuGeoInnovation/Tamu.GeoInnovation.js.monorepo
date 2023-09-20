import { Column, Entity, ManyToOne } from 'typeorm';

import { GuidIdentity } from '../../entities/all.entity';
import { Season } from '../../season/entities/season.entity';

@Entity({ name: 'seasons_days' })
export class SeasonDay extends GuidIdentity {
  @Column({ nullable: false })
  date: Date;

  // Season day belongs to a season
  @ManyToOne(() => Season, (season) => season.days, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  season: Season;
}
