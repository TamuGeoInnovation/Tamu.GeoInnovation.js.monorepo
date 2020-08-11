import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';

import { config } from '@tamu-gisc/covid/data-api';
import { CategoryValue } from '@tamu-gisc/covid/common/entities';
import { CategoryValuesService } from './category-values.service';
import { CategoryValueModule } from './category-values.module';
describe('Category Values Integration Tests', () => {
  let categoryValuesService: CategoryValuesService;
  let categoryValuesrepo: Repository<CategoryValue>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CategoryValueModule, TypeOrmModule.forFeature([CategoryValue]), TypeOrmModule.forRoot(config)],
      providers: [CategoryValuesService]
    }).compile();

    categoryValuesService = module.get<CategoryValuesService>(CategoryValuesService);
    categoryValuesrepo = module.get<Repository<CategoryValue>>(getRepositoryToken(CategoryValue));
  });

  /**
   * after all tests are done, delete everything from each table
   */

  afterAll(async () => {
    const connection = getConnection();
    await connection.close();
  });

  describe('Validation', () => {
    it('service should be defined', async () => {
      expect(categoryValuesService).toBeDefined();
    });
  });
});
