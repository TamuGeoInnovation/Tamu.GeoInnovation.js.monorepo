import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldCategory, FieldType, CategoryValue } from '@tamu-gisc/covid/common/entities';
import { FieldCategoriesController } from './field-categories.controller';
import { FieldCategoriesService } from './field-categories.service';


describe('FieldCategories Controller', () => {
  let controller: FieldCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldCategoriesService,
        { provide: getRepositoryToken(FieldCategory), useClass: Repository },
        { provide: getRepositoryToken(FieldType), useClass: Repository },
        { provide: getRepositoryToken(CategoryValue), useClass: Repository } 
      ],
      controllers: [FieldCategoriesController],
    }).compile();

    controller = module.get<FieldCategoriesController>(FieldCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
