import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Token } from '@tamu-gisc/veoride/common/entities';

import { AuthService } from './services/auth.service';
import { BearerTokenStrategy } from './strategies/bearer-strategy/bearer-strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  providers: [AuthService, BearerTokenStrategy]
})
export class AuthModule {}
