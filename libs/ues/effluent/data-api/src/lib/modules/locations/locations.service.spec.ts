import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Location } from '@tamu-gisc/ues/effluent/common/entities';

import { LocationsService } from './locations.service';

describe('LocationsService', () => {
  let service: LocationsService;
  /* */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationsService, { provide: getRepositoryToken(Location), useValue: {} }]
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
