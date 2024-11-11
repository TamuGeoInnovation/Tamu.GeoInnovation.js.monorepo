import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Class } from '@tamu-gisc/gisday/platform/data-api';
import { ClassService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.scss']
})
export class ClassListComponent extends BaseAdminListComponent<Class> {
  constructor(
    private readonly classService: ClassService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(classService, ss, ar, rt, ms, ns);
  }
}
