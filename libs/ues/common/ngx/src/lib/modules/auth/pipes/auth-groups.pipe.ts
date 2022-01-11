import { Pipe, PipeTransform } from '@angular/core';

import { Roles } from '@tamu-gisc/ues/common/nest';
import { isAuthorized } from '../utils/utils';

@Pipe({
  name: 'authGroups'
})
export class AuthGroupsPipe implements PipeTransform {
  public transform(userRoles: Array<Roles>, acceptedRoles: Array<Roles>): boolean {
    return isAuthorized(userRoles, acceptedRoles);
  }
}
