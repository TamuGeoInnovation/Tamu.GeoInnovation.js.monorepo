import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Sites } from '@tamu-gisc/two/common';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

describe('Sites Controller', () => {
  let controller: SitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitesService,
        {
          provide: getRepositoryToken(Sites),
          useClass: Repository
        }
      ],
      controllers: [SitesController]
    }).compile();

    controller = module.get<SitesController>(SitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
