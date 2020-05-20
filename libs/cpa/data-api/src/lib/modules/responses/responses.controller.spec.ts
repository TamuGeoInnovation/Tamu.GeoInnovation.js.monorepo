import { Test, TestingModule } from '@nestjs/testing';
import { ResponsesController } from './responses.controller';

import { ResponsesService } from './responses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from '@tamu-gisc/cpa/common/entities';

describe('Responses Controller', () => {
  let controller: ResponsesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponsesService,
        {provide: getRepositoryToken(Response), useClass: Repository}
      ],
      controllers: [ResponsesController],
    }).compile();

    controller = module.get<ResponsesController>(ResponsesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined(); 
     
  });
});
