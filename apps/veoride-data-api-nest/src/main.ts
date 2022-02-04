/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { environment, appConfig } from './environments/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = environment.port || process.env.PORT || 3333;
  app.setGlobalPrefix(environment.prefix);
  app.enableCors({
    origin: appConfig.origin
  });
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + environment.prefix);
  });
}

bootstrap();
