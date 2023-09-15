import { Test, TestingModule } from '@nestjs/testing';
import { UserClassController } from './user-class.controller';

describe('UserClass Controller', () => {
  let controller: UserClassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserClassController]
    }).compile();

    controller = module.get<UserClassController>(UserClassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
