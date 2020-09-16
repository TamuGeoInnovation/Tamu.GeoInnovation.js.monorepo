import { Controller } from '@nestjs/common';

import { Session } from '../../entities/all.entity';
import { SessionProvider } from '../../providers/session/session.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('session')
export class SessionController extends BaseController<Session> {
  constructor(private readonly sessionProvider: SessionProvider) {
    super(sessionProvider);
  }
}
