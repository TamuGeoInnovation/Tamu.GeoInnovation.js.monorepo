import { Injectable } from '@nestjs/common';

import { Role, RoleRepo } from '../../entities/all.entity';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepo) {}

  public async insertDefaultUserRoles() {
    const adminRole: Partial<Role> = {
      level: '99',
      name: 'Admin'
    };
    const _adminRole = this.roleRepo.create(adminRole);
    return this.roleRepo.save(_adminRole);
  }

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

  public async getAllRoles() {
    return this.roleRepo.find();
  }

  public async getRole(guid: string) {
    return this.roleRepo.findOne({
      where: {
        guid: guid
      }
    });
  }

  public async updateRole(role: Partial<Role>) {
    return this.roleRepo.create(role).save();
  }

  public async deleteRole(roleGuid: string) {
    const role = await this.roleRepo.findOne({
      where: {
        guid: roleGuid
      }
    });

    return this.roleRepo.remove(role);
  }
}
