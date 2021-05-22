import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Snapshot } from '@tamu-gisc/cpa/common/entities';

import { SnapshotsController } from './snapshots.controller';
import { SnapshotsService } from './snapshots.service';

describe('Snapshots Controller', () => {
  let controller: SnapshotsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SnapshotsService, { provide: getRepositoryToken(Snapshot), useClass: Repository }],

      controllers: [SnapshotsController]
    }).compile();

    controller = module.get<SnapshotsController>(SnapshotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
