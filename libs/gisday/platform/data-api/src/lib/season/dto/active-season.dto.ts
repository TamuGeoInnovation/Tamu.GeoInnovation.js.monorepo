import { Season } from '../../entities/all.entity';

export interface ActiveSeasonDto extends Partial<Season> {
  firstEventTime: string;
}
