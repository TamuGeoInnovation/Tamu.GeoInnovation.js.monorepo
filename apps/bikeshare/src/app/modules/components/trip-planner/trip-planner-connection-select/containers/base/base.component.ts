import { Component, OnInit } from '@angular/core';
import {
  TripPlannerConnectionService,
  TripPlannerConnection
} from '../../../../../services/trip-planner/trip-planner-connection.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'trip-planner-connection-select',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class TripPlannerConnectionsSelectComponent implements OnInit {
  /**
   * Stores a list of trip planner connections retrieved from the connections service.
   *
   * Used to populate the dropdown list for connection override.
   */
  public routingAliasesServiceList: Observable<TripPlannerConnection[]>;

  /**
   * Stores the name of the current network set in the trip planner connection service from the
   * class TripPlannerConnection class instance.
   *
   * Used to pre-populate the network in the dropdown list.
   */
  public currentUrlAlias: string;

  constructor(private connectionService: TripPlannerConnectionService) {}

  public ngOnInit() {
    // Subscribe to the routing network list. This populates the list of available networks for
    // testing through the async template pipe
    this.routingAliasesServiceList = this.connectionService.allNetworks;

    // Store the current routing network alias from the RoutingService class instance
    this.connectionService.currentNetwork.subscribe((connection) => (this.currentUrlAlias = connection.name));
  }

  /**
   * Sets a new routing network in the routing service in testing mode (dev or localhost).
   *
   */
  public setRoutingNetwork = (): void => {
    // Update the current network
    this.connectionService.network = this.currentUrlAlias;
  };
}
