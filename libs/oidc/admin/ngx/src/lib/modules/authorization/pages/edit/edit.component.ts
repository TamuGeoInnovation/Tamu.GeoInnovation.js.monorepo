import { Component, OnInit } from '@angular/core';

import { Observable, startWith, Subject, switchMap } from 'rxjs';

import { ISimplifiedUserRoleResponse } from '@tamu-gisc/oidc/common';
import { UserRoleService } from '@tamu-gisc/oidc/admin/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  private _$refresh: Subject<boolean> = new Subject();
  public $userRoles: Observable<Array<Partial<ISimplifiedUserRoleResponse>>>;

  constructor(private readonly userRoleService: UserRoleService, private notificationService: NotificationService) {}

  public ngOnInit() {
    this.$userRoles = this._$refresh.pipe(
      startWith(true),
      switchMap(() => {
        return this.userRoleService.getAll();
      })
    );
  }

  public deleteEntity(entity) {
    this.userRoleService.delete(entity.guid).subscribe(() => {
      this.notificationService.preset('deleted_user_role');

      this._$refresh.next(undefined);
    });
  }
}
