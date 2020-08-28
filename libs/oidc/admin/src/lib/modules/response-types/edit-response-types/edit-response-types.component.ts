import { Component, OnInit } from '@angular/core';
import { ResponseTypesService } from '@tamu-gisc/oidc/admin-data-access';
import { ResponseType } from '@tamu-gisc/oidc/provider-nest';
import { Observable } from 'rxjs';

@Component({
  selector: 'edit-response-types',
  templateUrl: './edit-response-types.component.html',
  styleUrls: ['./edit-response-types.component.scss']
})
export class EditResponseTypesComponent implements OnInit {
  public $responseTypes: Observable<Array<Partial<ResponseType>>>;

  constructor(private readonly responseService: ResponseTypesService) {
    this.$responseTypes = this.responseService.getResponseTypes();
  }
  ngOnInit(): void {}

  public deleteResponseType(responseType: ResponseType) {}
}
