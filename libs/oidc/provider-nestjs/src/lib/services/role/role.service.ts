import { Injectable } from '@nestjs/common';

import { Role, RoleRepo } from '../../entities/all.entity';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepo) {}

  public async insertRole(level: string, name: string) {
    const existingRole = await this.roleRepo.findOne({
      where: {
        level: level,
        name: name
      }
    });
    if (existingRole) {
      throw new Error('Role already exists');
    } else {
      const _role: Partial<Role> = {
        level: level,
        name: name
      };
      const role = this.roleRepo.create(_role);
      return this.roleRepo.save(role);
    }
  }

  public async insertRoles(_roles: Partial<Role>[]) {
    const roles = this.roleRepo.create(_roles);
    return this.roleRepo.save(roles);
  }

  public async getRole(guid: string) {
    return this.roleRepo.findOne({
      where: {
        guid: roleGuid
      }
    });
    return this.roleRepo.remove(role);
  }
}
