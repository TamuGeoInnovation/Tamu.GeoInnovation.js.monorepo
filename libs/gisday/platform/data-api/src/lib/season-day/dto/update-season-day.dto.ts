import { PartialType } from '@nestjs/mapped-types';
import { CreateSeasonDayDto } from './create-season-day.dto';

export class UpdateSeasonDayDto extends PartialType(CreateSeasonDayDto) {}
