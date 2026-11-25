import { Season } from '../../entities/all.entity';

export interface ActiveSeasonDto extends Partial<Season> {
  /** Null when the season's first day has no active events, or the season has no days. */
  firstEventTime: string | null;
}
