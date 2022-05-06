import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: environment.allowedOrigins,
      credentials: true
    }
  });

  app.setGlobalPrefix(environment.globalPrefix);

  await app.listen(environment.port, () => {
    console.log('Listening at http://localhost:' + environment.port + '/' + environment.globalPrefix);
  });
}

bootstrap();
