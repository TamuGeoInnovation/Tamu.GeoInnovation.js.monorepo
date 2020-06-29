import { Test, TestingModule } from '@nestjs/testing';
import { CountyClaimsController } from './county-claims.controller';

describe('CountyClaims Controller', () => {
  let controller: CountyClaimsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountyClaimsController],
    }).compile();

    controller = module.get<CountyClaimsController>(CountyClaimsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
