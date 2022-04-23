import { Component } from '@angular/core';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { GrantTypesService } from '@tamu-gisc/oidc/admin/data-access';
import { GrantType } from '@tamu-gisc/oidc/common';

@Component({
  selector: 'tamu-gisc-edit-grant-types',
  templateUrl: './edit-grant-types.component.html',
  styleUrls: ['./edit-grant-types.component.scss']
})
export class EditGrantTypesComponent {
  public $grantTypes: Observable<Array<Partial<GrantType>>>;

  constructor(private readonly grantService: GrantTypesService) {
    this.fetchGrantTypes();
  }

  public fetchGrantTypes() {
    this.$grantTypes = this.grantService.getGrantTypes().pipe(shareReplay(1));
  }

  public deleteGrantType(grantType: GrantType) {
    console.log('Deleting...', grantType);
    this.grantService.deleteGrantType(grantType).subscribe(() => {
      console.log('Deleted ', grantType.guid);
      this.fetchGrantTypes();
    });
  }
}
