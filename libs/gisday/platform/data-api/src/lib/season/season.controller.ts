import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';
import { SubmissionDeadlines } from '@tamu-gisc/gisday/common';

import { SeasonService } from './season.service';
import { Season } from '../entities/all.entity';

@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get('active')
  public findActiveSeason() {
    return this.seasonService.findOneActive();
  }

  @Get('year/:year')
  public findOneByYear(@Param('year', ParseIntPipe) year: number) {
    return this.seasonService.findOneByYear(year);
  }

  @Get(':guid')
  public findOne(@Param('guid') guid: string) {
    return this.seasonService.findOneWithOrderedDays(guid);
  }

  @Get()
  public findAll() {
    return this.seasonService.findAllOrdered();
  }

  @Permissions(['create:seasons'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public create() {
    return this.seasonService.clonePreviousSeason();
  }

  // When each competition closes (#2934, #2962), set from the competitions' admin page, so by those who
  // run the competitions rather than those who may change the season.
  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid/submission-deadlines')
  public setSubmissionDeadlines(@Param('guid', ParseUUIDPipe) guid: string, @Body() deadlines: SubmissionDeadlines) {
    return this.seasonService.setSubmissionDeadlines(guid, deadlines);
  }

  // Which research competitions the season runs (#2948), set beside their deadlines, by the same people.
  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid/competition-types')
  public setCompetitionTypes(
    @Param('guid', ParseUUIDPipe) guid: string,
    @Body() body: { competitionTypes?: Array<string> }
  ) {
    return this.seasonService.setCompetitionTypes(guid, body?.competitionTypes);
  }

  @Permissions(['update:seasons'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public update(@Param('guid') guid: string, @Body() updateSeasonDto: Partial<Season>) {
    return this.seasonService.updateSeason(guid, updateSeasonDto);
  }

  @Permissions(['delete:seasons'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public remove(@Param('guid') guid: string) {
    return this.seasonService.deleteEntity(guid);
  }
}
