import { Component, OnInit } from '@angular/core';
import { GrantTypesService } from '@tamu-gisc/oidc/admin-data-access';
import { GrantType } from '@tamu-gisc/oidc/provider-nest';
import { Observable } from 'rxjs';

@Component({
  selector: 'edit-grant-types',
  templateUrl: './edit-grant-types.component.html',
  styleUrls: ['./edit-grant-types.component.scss']
})
export class EditGrantTypesComponent implements OnInit {
  public $grantTypes: Observable<Array<Partial<GrantType>>>;

  constructor(private readonly grantService: GrantTypesService) {
    this.$grantTypes = this.grantService.getGrantTypes();
  }

  ngOnInit(): void {}

  public deleteGrantType(grantType: GrantType) {
    console.log('Deleting...', grantType);
  }
}
