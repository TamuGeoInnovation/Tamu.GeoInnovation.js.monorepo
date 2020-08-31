import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  TokenAuthMethodsService,
  ResponseTypesService,
  GrantTypesService,
  ClientMetadataService,
  IClientMetadataResponse,
  IClientMetadataResponseArrayed
} from '@tamu-gisc/oidc/admin-data-access';
import { ClientMetadata, GrantType, TokenEndpointAuthMethod, ResponseType } from '@tamu-gisc/oidc/provider-nest';

@Component({
  selector: 'detail-client-metadata',
  templateUrl: './detail-client-metadata.component.html',
  styleUrls: ['./detail-client-metadata.component.scss']
})
export class DetailClientMetadataComponent implements OnInit {
  public clientForm: FormGroup;
  public clientMetadata: Partial<IClientMetadataResponseArrayed>;
  public clientMetadataGuid: string;
  public $grantTypes: Observable<Array<Partial<GrantType>>>;
  public $responseTypes: Observable<Array<Partial<ResponseType>>>;
  public $tokenAuthMethods: Observable<Array<Partial<TokenEndpointAuthMethod>>>;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private clientService: ClientMetadataService,
    private grantService: GrantTypesService,
    private responseService: ResponseTypesService,
    private tokenService: TokenAuthMethodsService
  ) {
    this.clientForm = this.fb.group({
      guid: [''],
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

  ngOnInit(): void {
    this.fetchMetadata();
    if (this.route.snapshot.params.clientMetadataGuid) {
      this.clientMetadataGuid = this.route.snapshot.params.clientMetadataGuid;
      this.clientService.getClientMetadata(this.clientMetadataGuid).subscribe((clientMetadata) => {
        this.clientMetadata = clientMetadata;
        this.clientForm.patchValue(this.clientMetadata);
        // this.clientForm.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
        //   const newClientMetadata = this.clientForm.getRawValue();
        //   this.clientService
        //     .updateClientMetadata(newClientMetadata)
        //     .subscribe((result) => [console.log('Updated client metadata')]);
        // });
      });
    }
  }

  public addClientMetadata() {
    const joe = this.clientForm.getRawValue();
    this.clientService.updateClientMetadata(joe).subscribe((result) => [console.log('Updated client metadata')]);
  }
}
