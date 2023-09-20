import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { SeasonService } from './season.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';

@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get()
  public findAll() {
    return this.seasonService.findAllOrdered();
  }

  @Get(':guid')
  public findOne(@Param('guid') guid: string) {
    return this.seasonService.findOneWithOrderedDays(guid);
  }

  @Post()
  public create(@Body() createSeasonDto?: CreateSeasonDto) {
    return this.seasonService.create(createSeasonDto);
  }

  @Patch(':guid')
  public update(@Param('guid') guid: string, @Body() updateSeasonDto: UpdateSeasonDto) {
    return this.seasonService.updateSeason(guid, updateSeasonDto);
  }

  @Delete(':guid')
  public remove(@Param('guid') guid: string) {
    return this.seasonService.deleteEntity(guid);
  }
}
