import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User, TestingSite } from '@tamu-gisc/covid/common/entities';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('Users Controller', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(TestingSite), useClass: Repository }
      ],
      controllers: [UsersController]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
