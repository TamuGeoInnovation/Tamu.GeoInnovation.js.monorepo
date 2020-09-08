import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenController } from '../../controllers/access-token/access-token.controller';
import { AccessTokenService } from '../../services/access-token/access-token';
import { AccessTokenRepo } from '@tamu-gisc/oidc/provider-nest';

@Module({
  imports: [TypeOrmModule.forFeature([AccessTokenRepo])],
  providers: [AccessTokenService],
  controllers: [AccessTokenController],
  exports: [AccessTokenService]
})
export class AccessTokenModule {}
