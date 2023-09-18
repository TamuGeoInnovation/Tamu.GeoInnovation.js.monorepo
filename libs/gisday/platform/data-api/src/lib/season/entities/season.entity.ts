import { Column, OneToMany } from 'typeorm';

import { GuidIdentity } from '../../entities/all.entity';
import { SeasonDay } from '../../season-day/entities/season-day.entity';

export class Season extends GuidIdentity {
  @Column({ nullable: false })
  year: number;

  @Column({ default: false })
  active: boolean;

  // Season has multiple days
  @OneToMany(() => SeasonDay, (seasonDay) => seasonDay.season)
  days: SeasonDay[];
}
