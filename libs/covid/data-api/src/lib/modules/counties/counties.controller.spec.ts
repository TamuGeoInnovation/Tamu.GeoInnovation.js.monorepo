import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { County, CountyClaim, StatusType, EntityStatus, TestingSite } from '@tamu-gisc/covid/common/entities';
import { CountiesController } from './counties.controller';
import { CountiesService } from './counties.service';

describe('Counties Controller', () => {
  let controller: CountiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountiesService, 
        { provide: getRepositoryToken(County), useClass: Repository }, 
        { provide: getRepositoryToken(CountyClaim), useClass: Repository },
        { provide: getRepositoryToken(StatusType), useClass: Repository },
        { provide: getRepositoryToken(EntityStatus), useClass: Repository }, 
        { provide: getRepositoryToken(TestingSite), useClass: Repository }
      ],
      controllers: [CountiesController],
    }).compile();

    controller = module.get<CountiesController>(CountiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
