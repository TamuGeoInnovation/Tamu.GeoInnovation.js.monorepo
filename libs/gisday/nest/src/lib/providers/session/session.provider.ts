import { Injectable } from '@nestjs/common';

import { Session, SessionRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class SessionProvider extends BaseProvider<Session> {
  constructor(private readonly sessionRepo: SessionRepo) {
    super(sessionRepo);
  }
}
