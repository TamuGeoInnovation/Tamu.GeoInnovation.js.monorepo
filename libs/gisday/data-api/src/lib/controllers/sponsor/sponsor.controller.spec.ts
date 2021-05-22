import { Test, TestingModule } from '@nestjs/testing';
import { SponsorController } from './sponsor.controller';

describe('Sponsor Controller', () => {
  let controller: SponsorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SponsorController],
    }).compile();

    controller = module.get<SponsorController>(SponsorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
