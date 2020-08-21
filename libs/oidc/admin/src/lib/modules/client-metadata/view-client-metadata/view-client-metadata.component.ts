import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientMetadataService, IClientMetadataResponse } from '@tamu-gisc/oidc/admin-data-access';
import { ClientMetadata } from '@tamu-gisc/oidc/provider-nest';

@Component({
  selector: 'view-client-metadata',
  templateUrl: './view-client-metadata.component.html',
  styleUrls: ['./view-client-metadata.component.css']
})
export class ViewClientMetadataComponent implements OnInit {
  public $clients: Observable<Array<Partial<IClientMetadataResponse>>>;
  constructor(private readonly clientService: ClientMetadataService) {
    this.$clients = this.clientService.getClientMetadatas();
  }
  ngOnInit(): void {}
}
