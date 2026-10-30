import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { getRandomNumber } from '@tamu-gisc/common/utils/number';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TripPlannerNetworkTravelMode } from './trip-planner-travel-modes';

/**
 * The network Transportation published for #659. Its name is `RoutingProPublish/Map`, which is neither under the
 * `Routing` folder nor a dated name, so discovery below would find it and discard it.
 */
const DEVELOPMENT_NETWORK_NAME = 'RoutingProPublish/Map';

@Injectable({ providedIn: 'root' })
export class TripPlannerConnectionService {
  private http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);
  private readonly testing = inject(TestingService);

  private _allNetworks: BehaviorSubject<TripPlannerConnection[]>;
  private _abNetworks: BehaviorSubject<TripPlannerConnection[]>;
  private _latestNonAbNetwork: BehaviorSubject<TripPlannerConnection>;
  private _currentNetwork: BehaviorSubject<TripPlannerConnection>;
  private _override: BehaviorSubject<boolean>;
  private _supportedTravelModes = new BehaviorSubject<TripPlannerNetworkTravelMode[] | null>(null);

  private _store = {
    allNetworks: <Array<TripPlannerConnection>>[],
    abNetworks: <Array<TripPlannerConnection>>[],
    latestNonAbNetwork: <TripPlannerConnection>{},
    currentNetwork: <TripPlannerConnection>{}
  };

  private _serviceURL: string;

  public readonly allNetworks: Observable<TripPlannerConnection[]>;
  public readonly abNetworks: Observable<TripPlannerConnection[]>;
  public readonly latestNonAbNetwork: Observable<TripPlannerConnection>;
  public readonly currentNetwork: Observable<TripPlannerConnection>;
  public readonly override: Observable<boolean>;

  /**
   * What the current network can solve, as its Route layer lists it: `null` until it has answered, and an empty list
   * if it could not. The planner offers only the modes in it (#659).
   */
  public readonly supportedTravelModes: Observable<TripPlannerNetworkTravelMode[] | null> =
    this._supportedTravelModes.asObservable();

  constructor() {
    const connections = this.env.value('Connections', false);

    this._serviceURL = connections?.routingBaseUrl + '?f=pjson';

    // Instantiate Subjects and observables from subjects
    this._allNetworks = new BehaviorSubject([]);
    this._abNetworks = new BehaviorSubject([]);
    this._latestNonAbNetwork = new BehaviorSubject(
      new TripPlannerConnection({
        baseServiceUrl: this._serviceURL,
        name: '',
        type: ''
      })
    );
    this._currentNetwork = new BehaviorSubject(
      new TripPlannerConnection({
        baseServiceUrl: this._serviceURL,
        name: '',
        type: ''
      })
    );
    this._override = new BehaviorSubject(true);

    this.allNetworks = this._allNetworks.asObservable();
    this.abNetworks = this._abNetworks.asObservable();
    this.latestNonAbNetwork = this._latestNonAbNetwork.asObservable();
    this.currentNetwork = this._currentNetwork.asObservable();
    this.override = this._override.asObservable();

    // Where development-only features are on, use the network published for #659 and discover nothing: it has no dated
    // name for discovery to find. Production, and a development host asked to behave as production, discover as before.
    if (this.testing.isTesting && connections?.developmentRoutingBaseUrl) {
      const network = new TripPlannerConnection({
        baseServiceUrl: connections.developmentRoutingBaseUrl,
        name: DEVELOPMENT_NETWORK_NAME,
        type: 'NAServer'
      });

      this._store.allNetworks = [network];
      this._store.latestNonAbNetwork = network;
      this._allNetworks.next([network]);
      this._latestNonAbNetwork.next(network);

      this.connection();
      this.fetchSupportedTravelModes();

      return;
    }

    // Self-invoke the fetch networks method in the class to populate the full network and network list
    this.fetchNetworks();
  }

  /**
   * Asks the current network which travel modes it can solve. The planner reads it so that it offers only those, and so
   * that it finds each by name rather than by a number the planner and the network may not share.
   */
  private fetchSupportedTravelModes() {
    const network = this._store.currentNetwork;

    if (!network.name) {
      return;
    }

    this._supportedTravelModes.next(null);

    this.http.get<{ supportedTravelModes?: TripPlannerNetworkTravelMode[] }>(`${network.url()}?f=json`).subscribe({
      next: (res) => this._supportedTravelModes.next(res.supportedTravelModes ?? []),
      error: (err) => {
        console.error('Error fetching the routing network travel modes', err);

        this._supportedTravelModes.next([]);
      }
    });
  }

  private fetchNetworks() {
    this.http.get(this._serviceURL).subscribe({
      next: (res: { services: TripPlannerServiceType[] }) => {
        // Regex expression that checks against the allowed format for a service name.
        // Name must match the following pattern:
        //
        // Routing/YYYYMMDD[A|B] where:
        //
        // YYYY - Long year
        // MM - Two digit month
        // DD - Two digit day
        // [A|B] - Single character denoting if service is A or B
        //
        const abRxp = new RegExp('^(Routing/)\\d{8}[A|B]$');
        const defaultRxp = new RegExp('^(Routing/)\\d{8}$');

        this._store.allNetworks = res.services
          .filter((s: TripPlannerServiceType) => s.type === 'NAServer')
          .sort()
          .map(
            (s: TripPlannerServiceType) =>
              new TripPlannerConnection({ baseServiceUrl: this._serviceURL, name: s.name, type: s.type })
          );

        // Store all NA Services as networks
        this._allNetworks.next(Array.from(this._store.allNetworks));

        // Filter by those matching the allowed pattern
        const matchingABServices = this._store.allNetworks.filter((s) => {
          return abRxp.test(s.name);
        });

        const matchingNonABServices = this._store.allNetworks
          .filter((s) => {
            return defaultRxp.test(s.name);
          })
          .sort();

        // Filter uniques, without the service code
        const uniqueMatchingABServices = matchingABServices
          .filter((e, i, a) => {
            return (
              a.findIndex((o) => {
                return o.name.includes(e.name.substring(0, e.name.length - 1));
              }) === i
            );
          })
          .sort();

        const latestAB = (): TripPlannerConnection[] => {
          let networks = [];
          if (uniqueMatchingABServices.length > 0) {
            const latestPrefix = uniqueMatchingABServices[uniqueMatchingABServices.length - 1].name.substring(
              0,
              uniqueMatchingABServices[uniqueMatchingABServices.length - 1].name.length - 1
            );

            networks = matchingABServices.filter((s) => {
              return s.name.includes(latestPrefix);
            });

            // If the latestPrefix results in only one network, clone it and set it as the second.
            // This might happen while a new network is being published or only a single was erroneously published
            if (networks.length < 2) {
              networks.push(networks[0]);
            }
          }

          return networks;
        };

        const latestNonAB = (): TripPlannerConnection => {
          return matchingNonABServices[matchingNonABServices.length - 1];
        };

        // Compute and store and list of latest A/B Networks
        this._store.abNetworks = latestAB();

        // Compute and store the latest non-A/B network. There may be none: routing is unpublished on the production GIS
        // server (#1003), whose Routing folder lists nothing, and the empty network stays as it was (#2259).
        const latestNonAbNetwork = latestNonAB();

        if (latestNonAbNetwork) {
          this._store.latestNonAbNetwork = latestNonAbNetwork;
        }

        // Set the private abNetwork subject value, which triggers observable subscriptions
        this._abNetworks.next(Array.from(this._store.abNetworks));

        // Set the private latestNonAbNetwork subject value, which triggers observable subscriptions
        if (latestNonAbNetwork) {
          this._latestNonAbNetwork.next(latestNonAbNetwork);
        }

        // Select a random AB network and set it as the initial current network
        this.connection();

        this.fetchSupportedTravelModes();
      },
      error: (err) => {
        console.error('Error fetching routing services', err);
      }
    });
  }

  /**
   * Selects a randomly selected A/B network from latest.
   *
   * Sets the current network to be the selected A/B network.
   *
   * Returns the selected A/B network.
   *
   * @returns {TripPlannerConnection} RoutingService instance
   */
  public connection(): TripPlannerConnection {
    if (this._override.value) {
      if (!this._store.currentNetwork.name || !this._store.currentNetwork.type) {
        // Nothing published to connect to (#2259).
        if (!this._store.latestNonAbNetwork.name) {
          return undefined;
        }

        this._newCurrentNetwork = this._store.latestNonAbNetwork;

        // TODO: Remove this return once new implementation is in place
        return new TripPlannerConnection({
          baseServiceUrl: this._store.latestNonAbNetwork.baseServiceUrl,
          name: this._store.latestNonAbNetwork.name,
          type: this._store.latestNonAbNetwork.type
        });
      } else {
        this._newCurrentNetwork = this._store.currentNetwork;

        // TODO: Remove this return once new implementation is in place
        return new TripPlannerConnection({
          baseServiceUrl: this._store.currentNetwork.baseServiceUrl,
          name: this._store.currentNetwork.name,
          type: this._store.currentNetwork.type
        });
      }
    } else {
      // Check the number of arguments in the route alias array. Must have a minimum of two.
      if (this._store && this._store.abNetworks.length >= 2) {
        // Get a random number
        const rand = getRandomNumber(0, this._store.abNetworks.length);

        this._newCurrentNetwork = this._store.abNetworks[rand];

        // TODO: Remove this return once new implementation is in place
        return new TripPlannerConnection({
          baseServiceUrl: this._serviceURL,
          name: this._store.currentNetwork.name,
          type: this._store.currentNetwork.type
        });
      }
    }
  }

  /**
   * Sets the current network by network name reference.
   */
  public set network(name) {
    // Find the network object by name reference
    const newNetwork = this._store.allNetworks.find((o) => {
      return (o.name = name);
    });

    if (newNetwork) {
      // Set the new current network with the found reference
      this._newCurrentNetwork = newNetwork;

      // Since a network was manually specified, set the override property to true
      this._override.next(true);
    } else {
      console.warn('Could not find referenced network. Current network has not been modified.');
    }
  }

  /**
   * Sets service override state. Will determine whether the connection() method will return a random
   * connection when request or a user-defined.
   *
   * @param {boolean} value `true` will instruct connection() method to return a user-defined network.
   * `false` will instruct connection() method to return a random a/b network.
   */
  public setOverride(value: boolean) {
    this._override.next(value);
  }

  /**
   * Used internally. Will set the current network value to be a new immutable class instance of
   * RoutingService based on the provided reference object.
   *
   * Will trigger all subscribers to currentNetwork.
   */
  private set _newCurrentNetwork(ref: TripPlannerConnection) {
    // Copy network properties to assign to new immutable;
    const props = Object.assign({}, ref);

    // Create a new immutable class reference. It keeps the network's own server: the development network is not on the
    // one the discovery address names.
    const connection = new TripPlannerConnection({
      baseServiceUrl: props.baseServiceUrl ?? this._serviceURL,
      name: props.name,
      type: props.type
    });

    // Store randomly selected network in the service store.
    this._store.currentNetwork = connection;

    // Set new value of subject and trigger observable subscription.
    this._currentNetwork.next(connection);
  }
}

export interface TripPlannerServiceType {
  baseServiceUrl: string;
  type: string;
  name: string;
}

export class TripPlannerConnection {
  public baseServiceUrl: string;
  public name: string;
  public type: string;

  constructor(props: TripPlannerServiceType) {
    this.baseServiceUrl = props.baseServiceUrl;
    this.name = props.name;
    this.type = props.type;
  }

  /**
   * Returns a constructed URL from its name and type properties.
   */
  public url(): string {
    const url = new URL(this.baseServiceUrl);
    return `https://${url.host}/arcgis/rest/services/${this.name}/${this.type}/Route`;
  }
}
