/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import * as dotenv from 'dotenv';
dotenv.config();

import { Mailer } from '@tamu-gisc/oidc/common';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function bootstrap() {
  // Simple check for required environment variables
  if (environment.logging) {
    console.log('Logging is enabled');
    console.log('Environment variables: ', process.env);
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
  const port = environment.port;
  app.setGlobalPrefix(globalPrefix);

  Mailer.build('tamu-relay', environment.dev === 'true' ? true : false);

  await app.listen(port, () => {
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  });
}

bootstrap();
