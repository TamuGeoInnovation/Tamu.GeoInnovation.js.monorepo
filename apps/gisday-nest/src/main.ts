import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { environment, origins } from './environments/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: origins,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    }
  });

  const globalPrefix = environment.globalPrefix;
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.port || environment.port;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();
