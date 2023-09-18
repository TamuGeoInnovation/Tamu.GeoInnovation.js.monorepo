import { Injectable } from '@nestjs/common';
import { CreateSeasonDayDto } from './dto/create-season-day.dto';
import { UpdateSeasonDayDto } from './dto/update-season-day.dto';

@Injectable()
export class SeasonDayService {
  create(createSeasonDayDto: CreateSeasonDayDto) {
    return 'This action adds a new seasonDay';
  }

  findAll() {
    return `This action returns all seasonDay`;
  }

  findOne(id: number) {
    return `This action returns a #${id} seasonDay`;
  }

  update(id: number, updateSeasonDayDto: UpdateSeasonDayDto) {
    return `This action updates a #${id} seasonDay`;
  }

  remove(id: number) {
    return `This action removes a #${id} seasonDay`;
  }
}
