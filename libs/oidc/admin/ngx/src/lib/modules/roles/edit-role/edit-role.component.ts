import { Component, OnInit } from '@angular/core';

import { shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { RolesService } from '@tamu-gisc/oidc/admin/data-access';
import { Role } from '@tamu-gisc/oidc/common';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-edit-role',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss']
})
export class EditRoleComponent implements OnInit {
  private _$refresh: Subject<boolean> = new Subject();
  public $roles: Observable<Array<Partial<Role>>>;

  constructor(private readonly rolesService: RolesService, private notificationService: NotificationService) {}

  public ngOnInit() {
    this.$roles = this._$refresh.pipe(
      startWith(true),
      switchMap(() => {
        return this.rolesService.getRoles().pipe(shareReplay(1));
      })
    );
  }

  public deleteRole(role: Role) {
    this.rolesService.deleteRole(role).subscribe(() => {
      this.notificationService.preset('deleted_role');

      this._$refresh.next(undefined);
    });
  }
}
