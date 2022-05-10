import { DynamicModule, Module } from '@nestjs/common';

import { EnvironmentService } from './services/environment/environment.service';
import { ENVIRONMENT } from './tokens/environment.token';

@Module({})
export class EnvironmentModule {
  public static forRoot(env): DynamicModule {
    return {
      global: true,
      module: EnvironmentModule,
      providers: [
        EnvironmentService,
        {
          provide: ENVIRONMENT,
          useValue: env
        }
      ],
      exports: [EnvironmentService]
    };
  }
}
