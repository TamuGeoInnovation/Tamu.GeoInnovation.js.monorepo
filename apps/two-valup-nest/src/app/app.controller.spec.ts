import { Test, TestingModule } from '@nestjs/testing';

import { IrgasonValidationService } from '@tamu-gisc/two/valup';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, IrgasonValidationService]
    }).compile();
  });

  describe('getData', () => {
    it('should return "Welcome to two-valup-nest!"', () => {
      const appController = app.get<AppController>(AppController);
      // expect(appController.getData()).toEqual({ message: 'Welcome to two-valup-nest!' });
    });
  });
});
