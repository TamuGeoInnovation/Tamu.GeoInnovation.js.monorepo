import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public getHello(): string {
    return 'GIS Day API: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/tree/development/apps/gisday-nest';
  }
}
