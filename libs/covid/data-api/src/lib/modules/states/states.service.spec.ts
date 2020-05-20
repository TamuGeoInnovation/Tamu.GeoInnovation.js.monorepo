import { Test, TestingModule } from '@nestjs/testing'; 
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from '@tamu-gisc/covid/common/entities';
import { StatesService } from './states.service';

describe('StatesService', () => {
  let service: StatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatesService,
        { provide: getRepositoryToken(State), useClass: Repository }
      ]
    }).compile();
    service = module.get<StatesService>(StatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
