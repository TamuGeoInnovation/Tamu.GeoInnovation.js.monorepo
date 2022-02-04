import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MDSVehicleDto, Vehicle } from '@tamu-gisc/veoride/common/entities';

@Injectable()
export class VehiclesService {
  constructor(@InjectRepository(Vehicle) private readonly repo: Repository<Vehicle>) {}

  public async getAllVehicles(): Promise<Array<Partial<MDSVehicleDto>>> {
    const vehicles = await this.repo.find();
    const dtos = vehicles.map((v) => Vehicle.toDto(v));

    return dtos;
  }

  public async getBasicVehiclesAsGeojson(format: string) {
    if (format === 'geojson') {
      const vehicles = await this.repo.find();
      const dtos = vehicles.map((v) => Vehicle.toGeoJSONBasicDto(v));

      return {
        type: 'FeatureCollection',
        features: dtos
      };
    } else {
      return new NotImplementedException();
    }
  }
}
