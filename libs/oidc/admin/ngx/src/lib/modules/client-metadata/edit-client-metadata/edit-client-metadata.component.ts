import { Component } from '@angular/core';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { ClientMetadataService, IClientMetadataResponse } from '@tamu-gisc/oidc/admin/data-access';
import { ClientMetadata } from '@tamu-gisc/oidc/common';

@Component({
  selector: 'tamu-gisc-edit-client-metadata',
  templateUrl: './edit-client-metadata.component.html',
  styleUrls: ['./edit-client-metadata.component.scss']
})
export class EditClientMetadataComponent {
  public $clients: Observable<Array<Partial<IClientMetadataResponse>>>;

  constructor(private readonly clientService: ClientMetadataService) {
    this.fetchClientMetadata();
  }

  public fetchClientMetadata() {
    this.$clients = this.clientService.getClientMetadatas().pipe(shareReplay(1));
  }

  public deleteClientMetadata(client: ClientMetadata) {
    this.clientService.deleteClientMetadata(client).subscribe(() => {
      this.fetchClientMetadata();
    });
  }
}
