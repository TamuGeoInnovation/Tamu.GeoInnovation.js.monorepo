import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { logStartupEnvironment } from '@tamu-gisc/common/nest/environment';

import * as dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function bootstrap() {
  // Says only that logging is on: the environment carries secrets, so it is never printed (#1514, #1518).
  logStartupEnvironment(process.env);

  if (environment.logging) {
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
}

bootstrap();
