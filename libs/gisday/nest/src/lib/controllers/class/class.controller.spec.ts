import { Test, TestingModule } from '@nestjs/testing';
import { ClassController } from './class.controller';

describe('Class Controller', () => {
  let controller: ClassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassController],
    }).compile();

    controller = module.get<ClassController>(ClassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
