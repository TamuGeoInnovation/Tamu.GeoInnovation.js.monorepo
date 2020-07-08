import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Role, RoleRepo } from '../../entities/all.entity';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepo) {}

  public async insertRole(req: Request) {
    const existingRole = await this.roleRepo.findOne({
      where: {
        level: req.body.level,
        name: req.body.name
      }
    });
    if (existingRole) {
      throw new Error('Role already exists');
    } else {
      const _role: Partial<Role> = {
        level: req.body.level,
        name: req.body.name
      };
      const role = this.roleRepo.create(_role);
      this.roleRepo.save(role);
    }
  }

  public async getAllRoles() {
    return this.roleRepo.find();
  }
}
