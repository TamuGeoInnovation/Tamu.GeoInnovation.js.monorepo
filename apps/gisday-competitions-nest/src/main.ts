/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = environment.prefix;
  const port = process.env.port ? process.env.port : environment.port;
  app.enableCors();
  // As gisday-nest: drop undeclared fields, and reject a body whose class declares no rules (#2113).
  app.useGlobalPipes(
    new ValidationPipe({ disableErrorMessages: environment.production, forbidUnknownValues: true, whitelist: true })
  );
  app.setGlobalPrefix(globalPrefix);
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();
