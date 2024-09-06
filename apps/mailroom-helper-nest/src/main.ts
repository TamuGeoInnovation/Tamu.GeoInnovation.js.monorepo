/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import * as dotenv from 'dotenv';
dotenv.config();

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function bootstrap() {
  // Simple check for required environment variables
  if (environment.logging) {
    console.log('Logging is enabled');
    console.log('Environment variables: ', process.env);
    console.log('Origins: ', environment.origins);
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
  app.enableCors();

  const port = environment.port;
  await app.listen(port, () => {
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  });

  Logger.log(`Using mailroom endpoint: ${environment.mailroomUrl}`);
}

bootstrap();
