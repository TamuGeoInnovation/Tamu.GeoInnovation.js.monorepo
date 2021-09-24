import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public getData(): { message: string } {
    return {
      message: 'View API documentation @ https://github.com/TamuGeoInnovation/TAMU.GeoInnovation.VeoRide.Documentation/wiki'
    };
  }
}
