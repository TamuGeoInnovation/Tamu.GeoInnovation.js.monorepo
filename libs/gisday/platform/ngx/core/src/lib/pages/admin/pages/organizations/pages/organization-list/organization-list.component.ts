import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Organization } from '@tamu-gisc/gisday/platform/data-api';
import { OrganizationService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent extends BaseAdminListComponent<Organization> {
  constructor(
    private readonly orgService: OrganizationService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(orgService, ss, ar, rt, ms, ns);
  }
}
