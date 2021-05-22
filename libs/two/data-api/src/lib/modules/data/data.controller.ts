import { Controller, Get, Param } from '@nestjs/common';
import { Between } from 'typeorm';

import { WeatherfluxService } from './services/weatherflux/weatherflux.service';
import { ProFluxService } from './services/proflux/proflux.service';
import { SoilsService } from './services/soils/soils.service';
import { AncillaryService } from './services/ancillary/ancillary.service';

@Controller('data')
export class DataController {
  constructor(
    private ancillary: AncillaryService,
    private soils: SoilsService,
    private proflux: ProFluxService,
    private weatherflux: WeatherfluxService
  ) {}

  @Get('1/:stations/:columns/:start/:end')
  public getProFlusData(@Param() params) {
    return this.proflux.getData({
      select: [
        'siteid',
        'sitecode',
        'file_date',
        'file_time',
        ...params.columns.split(',').map((c) => c.trim().toLowerCase())
      ],
      where: params.stations.split(',').map((s) => {
        return {
          siteid: s,
          file_date: Between(params.start, params.end)
        };
      })
    });
  }

  @Get('2/:stations/:columns/:start/:end')
  public getWeatherFluxData(@Param() params) {
    return this.weatherflux.getData({
      select: ['siteid', 'sitecode', 'timestamp', ...params.columns.split(',').map((c) => c.trim().toLowerCase())],
      where: params.stations.split(',').map((s) => {
        return {
          siteid: s,
          timestamp: Between(params.start, params.end)
        };
      }),
      order: {
        timestamp: 'ASC'
      }
    });
  }

  @Get('3/:stations/:columns/:start/:end')
  public getAncillaryData(@Param() params) {
    return this.ancillary.getData({
      select: ['siteid', 'sitecode', 'timestamp', ...params.columns.split(',').map((c) => c.trim().toLowerCase())],
      where: params.stations.split(',').map((s) => {
        return {
          siteid: s,
          timestamp: Between(params.start, params.end)
        };
      }),
      order: {
        timestamp: 'ASC'
      }
    });
  }

  @Get('4/:stations/:columns/:start/:end')
  public getSoilsData(@Param() params) {
    return this.soils.getData({
      select: ['siteid', 'sitecode', 'timestamp', ...params.columns.split(',').map((c) => c.trim().toLowerCase())],
      where: params.stations.split(',').map((s) => {
        return {
          siteid: s,
          timestamp: Between(params.start, params.end)
        };
      }),
      order: {
        timestamp: 'ASC'
      }
    });
  }
}
