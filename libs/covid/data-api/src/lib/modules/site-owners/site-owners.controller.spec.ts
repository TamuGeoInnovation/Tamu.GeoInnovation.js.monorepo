import { Test, TestingModule } from '@nestjs/testing';
import { SiteOwnersController } from './site-owners.controller';

describe('SiteOwners Controller', () => {
  let controller: SiteOwnersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteOwnersController],
    }).compile();

    controller = module.get<SiteOwnersController>(SiteOwnersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
