import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Token } from '@tamu-gisc/veoride/common/entities';

import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { JWT_OPTIONS } from '../auth/symbols/jwt-options.symbol';
import { VeorideModuleRegistrationOptions } from '../../interfaces/module-registration.interface';

@Module({})
export class TokensModule {
  public static register(options: VeorideModuleRegistrationOptions['jwt']): DynamicModule {
    return {
      module: TokensModule,
      imports: [TypeOrmModule.forFeature([Token])],
      providers: [TokensService, { provide: JWT_OPTIONS, useValue: options }],
      controllers: [TokensController]
    };
  }
}
