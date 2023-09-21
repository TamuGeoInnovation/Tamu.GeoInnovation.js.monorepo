import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { SeasonService } from './season.service';
import { Season } from '../entities/all.entity';

@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get('active')
  public findActiveSeason() {
    return this.seasonService.findOneActive();
  }

  @Get(':guid')
  public findOne(@Param('guid') guid: string) {
    return this.seasonService.findOneWithOrderedDays(guid);
  }

  @Get()
  public findAll() {
    return this.seasonService.findAllOrdered();
  }

  @Post()
  public create(@Body() createSeasonDto?: Partial<Season>) {
    return this.seasonService.create(createSeasonDto);
  }

  @Patch(':guid')
  public update(@Param('guid') guid: string, @Body() updateSeasonDto: Partial<Season>) {
    return this.seasonService.updateSeason(guid, updateSeasonDto);
  }

  @Delete(':guid')
  public remove(@Param('guid') guid: string) {
    return this.seasonService.deleteEntity(guid);
  }
}
