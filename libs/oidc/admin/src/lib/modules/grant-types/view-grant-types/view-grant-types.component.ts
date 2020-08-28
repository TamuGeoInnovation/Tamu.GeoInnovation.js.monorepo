import { Component, OnInit } from '@angular/core';
import { GrantTypesService } from '@tamu-gisc/oidc/admin-data-access';
import { GrantType } from '@tamu-gisc/oidc/provider-nest';
import { Observable } from 'rxjs';

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
  ngOnInit(): void {}
}
