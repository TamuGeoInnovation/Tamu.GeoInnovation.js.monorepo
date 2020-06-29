import { Test, TestingModule } from '@nestjs/testing';
import { ResponsesService } from './responses.service';

describe('ResponsesService', () => {
  let service: ResponsesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponsesService],
    }).compile();

    service = module.get<ResponsesService>(ResponsesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
