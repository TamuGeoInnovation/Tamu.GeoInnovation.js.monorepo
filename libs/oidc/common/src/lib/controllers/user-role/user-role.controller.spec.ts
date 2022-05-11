import { Test, TestingModule } from '@nestjs/testing';
import { UserRoleController } from './user-role.controller';

describe('UserRoleController', () => {
  let controller: UserRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRoleController],
    }).compile();

    controller = module.get<UserRoleController>(UserRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
