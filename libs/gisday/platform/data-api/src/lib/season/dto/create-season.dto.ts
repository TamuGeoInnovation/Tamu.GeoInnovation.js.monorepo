import { SeasonDay } from '../../entities/all.entity';

export class CreateSeasonDto {
  year: number;
  active: boolean;
  days: SeasonDay[];
}
