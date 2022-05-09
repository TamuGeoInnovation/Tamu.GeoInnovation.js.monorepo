import { Component, OnInit } from '@angular/core';

import { map, mergeMap, Observable, toArray } from 'rxjs';

import { ClientService } from '@tamu-gisc/oidc/admin/data-access';

@Component({
  selector: 'tamu-gisc-view-client',
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.scss']
})
export class ViewClientComponent implements OnInit {
  public $clients: Observable<Array<Partial<IClientData>>>;

  constructor(private readonly clientService: ClientService) {}

  // public ngOnInit(): void {
  //   this.clientService.baseService.getEntities
  // }

  public ngOnInit() {
    this.$clients = this.clientService.getEntities().pipe(
      mergeMap((clients) => clients),
      map((client) => {
        const clientData: IClientData = JSON.parse(client.data);

        return clientData;
      }),
      toArray()
    );
  }
}

interface IClientData {
  application_type: string;
  grant_types: string[];
  id_token_signed_response_alg: string;
  post_logoout_redirect_uris: string[];
  require_auth_time: boolean;
  response_types: string[];
  subject_type: string;
  token_endpoint_auth_method: string;
  revocation_endpoint_auth_method: string;
  backchannel_logout_session_required: boolean;
  require_signed_request_object: boolean;
  request_uris: string[];
  client_id_issued_at: number;
  client_id: string;
  client_name: string;
  redirect_uris: string[];
}

