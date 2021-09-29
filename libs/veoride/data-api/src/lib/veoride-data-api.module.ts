import { DynamicModule, Module } from '@nestjs/common';

import { TripsModule } from './modules/trips/trips.module';
import { StatusChangesModule } from './modules/status-changes/status-changes.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { AuthModule } from './modules/auth/auth.module';
import { VeorideModuleRegistrationOptions } from './interfaces/module-registration.interface';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({})
export class VeorideDataApiModule {
  public static register(options: VeorideModuleRegistrationOptions): DynamicModule {
    return {
      module: VeorideDataApiModule,
      imports: [
        TripsModule,
        StatusChangesModule,
        TokensModule.register(options.jwt),
        AuthModule.register(options.jwt),
        TasksModule
      ],
      controllers: [],
      providers: [],
      exports: []
    };
  }
}
