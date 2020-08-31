import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientMetadataService, IClientMetadataResponse } from '@tamu-gisc/oidc/admin-data-access';
import { ClientMetadata } from '@tamu-gisc/oidc/provider-nest';
import { shareReplay } from 'rxjs/operators';

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

  ngOnInit(): void {}

  public fetchClientMetadata() {
    this.$clients = this.clientService.getClientMetadatas().pipe(shareReplay(1));
  }

  public deleteClientMetadata(client: ClientMetadata) {
    // console.log('Deleting...', client);
    this.clientService.deleteClientMetadata(client).subscribe((deleteStatus) => {
      // console.log('Deleted ', client.guid);
      this.fetchClientMetadata();
    });
  }
}
