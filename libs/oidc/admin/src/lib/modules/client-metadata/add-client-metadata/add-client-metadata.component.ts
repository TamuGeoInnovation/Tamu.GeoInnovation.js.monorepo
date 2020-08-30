import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';

import { GrantType, ResponseType, TokenEndpointAuthMethod } from '@tamu-gisc/oidc/provider-nest';
import {
  TokenAuthMethodsService,
  ResponseTypesService,
  GrantTypesService,
  ClientMetadataService
} from '@tamu-gisc/oidc/admin-data-access';

@Component({
  selector: 'add-client-metadata',
  templateUrl: './add-client-metadata.component.html',
  styleUrls: ['./add-client-metadata.component.scss']
})
export class AddClientMetadataComponent implements OnInit {
  public clientForm: FormGroup;
  public $grantTypes: Observable<Array<Partial<GrantType>>>;
  public $responseTypes: Observable<Array<Partial<ResponseType>>>;
  public $tokenAuthMethods: Observable<Array<Partial<TokenEndpointAuthMethod>>>;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientMetadataService,
    private grantService: GrantTypesService,
    private responseService: ResponseTypesService,
    private tokenService: TokenAuthMethodsService
  ) {
    this.fetchMetadata();
    this.clientForm = this.fb.group({
      clientName: [''],
      clientSecret: [''],
      redirectUris: [''],
      grantTypes: [[]],
      responseTypes: [[]],
      token_endpoint_auth_method: ['']
    });
  }

  public fetchMetadata() {
    this.$grantTypes = this.grantService.getGrantTypes();
    this.$responseTypes = this.responseService.getResponseTypes();
    this.$tokenAuthMethods = this.tokenService.getTokenAuthMethods();
  }

  public addClientMetadata() {
    const val = this.clientForm.value;
    console.log('ClientMetadata...', val);
    this.clientService.createClientMetadata(val);
  }

  public updateGrantType(grantType: GrantType) {}

  public updateResponseType(responseType: ResponseType) {}

  ngOnInit(): void {}
}
