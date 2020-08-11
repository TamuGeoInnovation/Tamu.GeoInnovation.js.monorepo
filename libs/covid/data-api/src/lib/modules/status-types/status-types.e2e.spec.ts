import { StatusTypesService } from './status-types.service';
import { Repository, getConnection } from 'typeorm';
import { StatusType } from '@tamu-gisc/covid/common/entities';
import { TestingModule, Test } from '@nestjs/testing';
import { StatusTypesModule } from './status-types.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { config } from '@tamu-gisc/covid/data-api';

describe('Status Types Integration Tests', () => {
  let statusTypesService: StatusTypesService;

  let statusTypesRepo: Repository<StatusType>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [StatusTypesModule, TypeOrmModule.forFeature([StatusType]), TypeOrmModule.forRoot(config)],
      providers: [StatusTypesService]
    }).compile();

    statusTypesService = module.get<StatusTypesService>(StatusTypesService);

    statusTypesRepo = module.get<Repository<StatusType>>(getRepositoryToken(StatusType));
  });

  afterAll(async () => {
    const connection = getConnection();
    await connection.close();
  });

  describe('Validation ', () => {
    it('service should be defined', () => {
      expect(statusTypesService).toBeDefined();
    });
  });
});
