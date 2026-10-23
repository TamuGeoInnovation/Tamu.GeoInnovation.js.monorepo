import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { logStartupEnvironment } from '@tamu-gisc/common/nest/environment';

import * as dotenv from 'dotenv';
dotenv.config();

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function bootstrap() {
  logStartupEnvironment(process.env);

  // Simple check for required environment variables

  if (
    process.env.AUTH0_AUDIENCE === undefined ||
    process.env.AUTH0_AUDIENCE === '' ||
    process.env.AUTH0_ISSUER_URL === undefined ||
    process.env.AUTH0_ISSUER_URL === '' ||
    process.env.APP_DATA === undefined ||
    process.env.APP_DATA === ''
  ) {
    console.error('Missing environment variables. Check .env config file.');
    process.exit(1);
  }

  if (
    process.env.TYPEORM_CONNECTION === undefined ||
    process.env.TYPEORM_CONNECTION === '' ||
    process.env.TYPEORM_HOST === undefined ||
    process.env.TYPEORM_HOST === '' ||
    process.env.TYPEORM_USERNAME === undefined ||
    process.env.TYPEORM_USERNAME === '' ||
    process.env.TYPEORM_PASSWORD === undefined ||
    process.env.TYPEORM_PASSWORD === '' ||
    process.env.TYPEORM_DATABASE === undefined ||
    process.env.TYPEORM_DATABASE === ''
  ) {
    console.error('Missing db environment variables. Check .env config file.');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: environment.origins,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    }
  });

  const globalPrefix = environment.globalPrefix;
  app.setGlobalPrefix(globalPrefix);
  app.use(json({ limit: '50mb' }));
  // whitelist drops any field a DTO does not declare, and forbidUnknownValues rejects a body whose class declares
  // no rules at all (#2113). Nest turns the second off unless told; class-validator has defaulted it on since 0.14.
  // A body typed as an interface, Partial<> or DeepPartial<> reaches the pipe as Object and is not validated.
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true, whitelist: true }));

  const port = environment.port;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + globalPrefix);
  });
}

bootstrap();
