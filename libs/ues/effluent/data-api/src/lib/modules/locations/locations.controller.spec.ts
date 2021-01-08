import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Location } from '@tamu-gisc/ues/effluent/common/entities';

import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

describe('Locations Controller', () => {
  let controller: LocationsController;
  /* */

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [LocationsService, { provide: getRepositoryToken(Location), useValue: {} }]
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
