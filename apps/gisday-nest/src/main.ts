import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function bootstrap() {
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

  const port = environment.port;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();
