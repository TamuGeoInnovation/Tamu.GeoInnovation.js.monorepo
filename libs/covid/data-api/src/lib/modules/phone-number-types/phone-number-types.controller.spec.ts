import { Test, TestingModule } from '@nestjs/testing';
import { PhoneNumberTypesController } from './phone-number-types.controller';

describe('PhoneNumberTypes Controller', () => {
  let controller: PhoneNumberTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhoneNumberTypesController],
    }).compile();

    controller = module.get<PhoneNumberTypesController>(PhoneNumberTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
