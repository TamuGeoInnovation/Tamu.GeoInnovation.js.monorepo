import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService]
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    /**
     * The generated spec asserted the Nest starter's 'Hello World!'. The service was changed to
     * return a pointer to the repository instead, and the spec was never updated. Asserts the
     * actual contract -- a non-empty string identifying the service -- rather than the exact URL,
     * which would break on any docs reorganisation.
     */
    it('returns a service identifier from the root route', () => {
      const response = appController.getHello();

      expect(typeof response).toBe('string');
      expect(response).toContain('GIS Day API');
    });
  });
});
