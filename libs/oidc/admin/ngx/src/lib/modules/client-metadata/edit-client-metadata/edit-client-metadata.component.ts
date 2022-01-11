import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { ClientMetadataService, IClientMetadataResponse } from '@tamu-gisc/oidc/admin/data-access';
import { ClientMetadata } from '@tamu-gisc/oidc/common';

@Component({
  selector: 'edit-client-metadata',
  templateUrl: './edit-client-metadata.component.html',
  styleUrls: ['./edit-client-metadata.component.scss']
})
export class EditClientMetadataComponent implements OnInit {
  public $clients: Observable<Array<Partial<IClientMetadataResponse>>>;

  constructor(private readonly clientService: ClientMetadataService) {
    this.fetchClientMetadata();
  }

  public ngOnInit(): void {}

  public fetchClientMetadata() {
    this.$clients = this.clientService.getClientMetadatas().pipe(shareReplay(1));
  }

  public deleteClientMetadata(client: ClientMetadata) {
    this.clientService.deleteClientMetadata(client).subscribe((deleteStatus) => {
      this.fetchClientMetadata();
    });
  }
}
