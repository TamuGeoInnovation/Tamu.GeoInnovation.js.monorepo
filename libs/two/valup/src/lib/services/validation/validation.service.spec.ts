import { Test, TestingModule } from '@nestjs/testing';

import { IrgasonValidationService } from './validation.service';

describe('IrgasonValidationService', () => {
  let service: IrgasonValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IrgasonValidationService]
    }).compile();

    service = module.get<IrgasonValidationService>(IrgasonValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
