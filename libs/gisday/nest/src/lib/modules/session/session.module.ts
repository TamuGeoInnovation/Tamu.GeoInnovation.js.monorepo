import { Module } from '@nestjs/common';
import { SessionController } from '../../controllers/session/session.controller';
import { SessionProvider } from '../../providers/session/session.provider';

@Module({
  imports: [],
  controllers: [SessionController],
  providers: [SessionProvider],
  exports: []
})
export class SessionModule {}
