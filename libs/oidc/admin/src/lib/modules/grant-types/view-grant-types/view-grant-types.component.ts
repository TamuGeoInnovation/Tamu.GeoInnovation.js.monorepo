import { Component, OnInit } from '@angular/core';
import { GrantTypesService } from '@tamu-gisc/oidc/admin-data-access';

import { Observable } from 'rxjs';

import { GrantType } from '@tamu-gisc/oidc/common';

@Component({
  selector: 'view-grant-types',
  templateUrl: './view-grant-types.component.html',
  styleUrls: ['./view-grant-types.component.scss']
})
export class ViewGrantTypesComponent implements OnInit {
  public $grantTypes: Observable<Array<Partial<GrantType>>>;

  constructor(private readonly grantService: GrantTypesService) {
    this.$grantTypes = this.grantService.getGrantTypes();
  }
  public ngOnInit(): void {}
}
