import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Token } from '@tamu-gisc/veoride/common/entities';

import { VeorideModuleRegistrationOptions } from '../../interfaces/module-registration.interface';
import { TokensService } from '../tokens/tokens.service';
import { AuthService } from './services/auth.service';
import { BearerTokenStrategy } from './strategies/bearer-strategy/bearer-strategy';
import { JWT_OPTIONS } from './symbols/jwt-options.symbol';

@Module({})
export class AuthModule {
  public static register(options: VeorideModuleRegistrationOptions['jwt']): DynamicModule {
    return {
      module: AuthModule,
      imports: [TypeOrmModule.forFeature([Token]), PassportModule],
      providers: [TokensService, AuthService, BearerTokenStrategy, { provide: JWT_OPTIONS, useValue: options }]
    };
  }
}
