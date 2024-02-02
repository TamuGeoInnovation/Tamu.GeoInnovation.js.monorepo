import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasRoles'
})
export class HasRolesPipe implements PipeTransform {
  public transform(roles: Array<string>, requiredRoles: Array<string>): boolean {
    if (roles === null) {
      return false;
    }

    return requiredRoles.some((role) => roles.includes(role));
  }
}
