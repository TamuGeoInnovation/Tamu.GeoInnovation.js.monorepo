import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as supertest from 'supertest';
import { Repository } from 'typeorm';

import { Response } from '@tamu-gisc/cpa/common/entities';
import { ResponsesModule } from './responses.module';

describe('User', () => {
  let app: INestApplication;
  let repository: Repository<Response>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ResponsesModule,
        TypeOrmModule.forRoot({
          type: 'mssql',
          host: '.',
          port: 1433,
          username: 'test',
          password: 'test',
          database: 'master',
          entities: ['./**/*.entity.ts'],
          synchronize: false
        })
      ]
    }).compile();

    app = module.createNestApplication();
    repository = module.get('ResponseRepository');
    await app.init();
  });

  afterEach(async () => {
    await repository.query(`DELETE FROM responses;`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      // Pre-populate the DB with some dummy users
      await repository.save([{ name: 'test-name-0' }, { name: 'test-name-1' }]);

      // Run your end-to-end test
      const { body } = await supertest
        .agent(app.getHttpServer())
        .get('/responses')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual([
        { id: expect.any(Number), name: 'test-name-0' },
        { id: expect.any(Number), name: 'test-name-1' }
      ]);
    });
  });
});
