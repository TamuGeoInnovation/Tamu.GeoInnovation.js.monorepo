import { Component } from '@angular/core';

import { Observable } from 'rxjs';

import { GrantType } from '@tamu-gisc/oidc/common';
import { GrantTypesService } from '@tamu-gisc/oidc/admin/data-access';

@Component({
  selector: 'tamu-gisc-view-grant-types',
  templateUrl: './view-grant-types.component.html',
  styleUrls: ['./view-grant-types.component.scss']
})
export class ViewGrantTypesComponent {
  public $grantTypes: Observable<Array<Partial<GrantType>>>;

  constructor(private readonly grantService: GrantTypesService) {
    this.$grantTypes = this.grantService.getGrantTypes();
  }
}
