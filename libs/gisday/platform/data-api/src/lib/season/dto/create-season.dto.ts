import { SeasonDay } from '../../season-day/entities/season-day.entity';

export class CreateSeasonDto {
  year: number;
  active: boolean;
  days: SeasonDay[];
}
