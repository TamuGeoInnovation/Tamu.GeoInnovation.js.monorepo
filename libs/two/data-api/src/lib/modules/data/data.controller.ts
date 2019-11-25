import { Controller, Get, Param } from '@nestjs/common';
import { DataService } from './data.service';
import { Between } from 'typeorm';

@Controller('data')
export class DataController {
  constructor(private service: DataService) {}

  @Get(':stations/:columns/:start/:end')
  public getData(@Param() params) {
    return this.service.getData({
      select: ['siteid', 'sitecode', ...params.columns.split(',').map((c) => c.trim().toLowerCase())],
      where: params.stations.split(',').map((s) => {
        return {
          siteid: s,
          timestamp: Between(params.start, params.end)
        };
      })
    });
  }
}
