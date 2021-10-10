import { DynamicModule, Module } from '@nestjs/common';

import { TripsModule } from './modules/trips/trips.module';
import { StatusChangesModule } from './modules/status-changes/status-changes.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { AuthModule } from './modules/auth/auth.module';
import { VeorideModuleRegistrationOptions } from './interfaces/module-registration.interface';
import { TasksModule } from './modules/tasks/tasks.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { LogsModule } from './modules/logs/logs.module';

@Module({})
export class VeorideDataApiModule {
  public static register(options: VeorideModuleRegistrationOptions): DynamicModule {
    return {
      module: VeorideDataApiModule,
      imports: [
        TripsModule.register(options.storage.datasets, options.baseUrl),
        StatusChangesModule.register(options.storage.datasets, options.baseUrl),
        TokensModule.register(options.jwt),
        AuthModule.register(options.jwt),
        TasksModule,
        VehiclesModule,
        LogsModule
      ],
      controllers: [],
      providers: [],
      exports: []
    };
  }
}
