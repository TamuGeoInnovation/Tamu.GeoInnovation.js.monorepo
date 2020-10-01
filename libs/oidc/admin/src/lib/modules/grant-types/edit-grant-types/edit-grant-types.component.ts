import { Component, OnInit } from '@angular/core';
import { GrantTypesService } from '@tamu-gisc/oidc/admin-data-access';
import { GrantType } from '@tamu-gisc/oidc/provider-nestjs';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'edit-grant-types',
  templateUrl: './edit-grant-types.component.html',
  styleUrls: ['./edit-grant-types.component.scss']
})
export class EditGrantTypesComponent implements OnInit {
  public $grantTypes: Observable<Array<Partial<GrantType>>>;

  constructor(private readonly grantService: GrantTypesService) {
    this.fetchGrantTypes();
  }

  ngOnInit(): void {}

  public fetchGrantTypes() {
    this.$grantTypes = this.grantService.getGrantTypes().pipe(shareReplay(1));
  }

  public deleteGrantType(grantType: GrantType) {
    console.log('Deleting...', grantType);
    this.grantService.deleteGrantType(grantType).subscribe((deleteStatus) => {
      console.log('Deleted ', grantType.guid);
      this.fetchGrantTypes();
    });
  }
}
