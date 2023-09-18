import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeasonDayService } from './season-day.service';
import { CreateSeasonDayDto } from './dto/create-season-day.dto';
import { UpdateSeasonDayDto } from './dto/update-season-day.dto';

@Controller('season-day')
export class SeasonDayController {
  constructor(private readonly seasonDayService: SeasonDayService) {}

  @Post()
  create(@Body() createSeasonDayDto: CreateSeasonDayDto) {
    return this.seasonDayService.create(createSeasonDayDto);
  }

  @Get()
  findAll() {
    return this.seasonDayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seasonDayService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeasonDayDto: UpdateSeasonDayDto) {
    return this.seasonDayService.update(+id, updateSeasonDayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seasonDayService.remove(+id);
  }
}
