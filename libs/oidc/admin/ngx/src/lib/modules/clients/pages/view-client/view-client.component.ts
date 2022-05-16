import { Component, OnInit } from '@angular/core';

import { map, mergeMap, Observable, toArray } from 'rxjs';

import { ClientService } from '@tamu-gisc/oidc/admin/data-access';
import { IClientData } from '@tamu-gisc/oidc/common';

@Component({
  selector: 'tamu-gisc-view-client',
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.scss']
})
export class ViewClientComponent implements OnInit {
  public $clients: Observable<Array<Partial<IClientData>>>;

  constructor(private readonly clientService: ClientService) {}

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
