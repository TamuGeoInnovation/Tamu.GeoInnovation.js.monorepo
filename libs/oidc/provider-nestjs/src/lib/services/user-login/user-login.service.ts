import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserLogin, UserLoginRepo } from '../../entities/all.entity';

@Injectable()
export class UserLoginService {
  constructor(public readonly loginRepo: UserLoginRepo) {}

  public async insertUserLogin(req: Request) {
    const now = new Date();

    const _newLogin: Partial<UserLogin> = {
      email_used: req.body.email,
      ip_addr: req.ip,
      grantId: req.params.uid,
      occured_at: now.toISOString()
    };
    const newLogin = await this.loginRepo.create(_newLogin);
    this.loginRepo.save(newLogin);
  }
}
