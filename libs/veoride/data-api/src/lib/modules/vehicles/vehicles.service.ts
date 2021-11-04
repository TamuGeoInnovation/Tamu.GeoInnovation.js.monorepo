import { Injectable } from '@nestjs/common';
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
}
