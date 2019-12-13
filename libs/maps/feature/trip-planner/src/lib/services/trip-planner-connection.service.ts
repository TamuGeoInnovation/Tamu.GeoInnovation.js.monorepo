import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { getRandomNumber } from '@tamu-gisc/common/utils/number';

@Injectable()
export class TripPlannerConnectionService {
  private _allNetworks: BehaviorSubject<TripPlannerConnection[]>;
  private _abNetworks: BehaviorSubject<TripPlannerConnection[]>;
  private _latestNonAbNetwork: BehaviorSubject<TripPlannerConnection>;
  private _currentNetwork: BehaviorSubject<TripPlannerConnection>;
  private _override: BehaviorSubject<boolean>;

  private _store = {
    allNetworks: <Array<TripPlannerConnection>>[],
    abNetworks: <Array<TripPlannerConnection>>[],
    latestNonAbNetwork: <TripPlannerConnection>{},
    currentNetwork: <TripPlannerConnection>{}
  };

  private _serviceURL = 'https://gis.tamu.edu/arcgis/rest/services/Routing?f=pjson';

  public readonly allNetworks: Observable<TripPlannerConnection[]>;
  public readonly abNetworks: Observable<TripPlannerConnection[]>;
  public readonly latestNonAbNetwork: Observable<TripPlannerConnection>;
  public readonly currentNetwork: Observable<TripPlannerConnection>;
  public readonly override: Observable<boolean>;

  constructor(private http: HttpClient) {
    // Instantiate Subjets and observables from subjects
    this._allNetworks = new BehaviorSubject([]);
    this._abNetworks = new BehaviorSubject([]);
    this._latestNonAbNetwork = new BehaviorSubject(
      new TripPlannerConnection({
        name: '',
        type: ''
      })
    );
    this._currentNetwork = new BehaviorSubject(
      new TripPlannerConnection({
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

    // Self-invoke the fetch networks method in the class to populate the full network and network list
    this.fetchNetworks();
  }

  private fetchNetworks() {
    this.http.get(this._serviceURL).subscribe(
      (res: { services: TripPlannerServiceType[] }) => {
        // Regex expression that checks against the allowed format for a service name.
        // Name must match the following pattern:
        //
        // Routing/YYYYMMDD[A|B] where:
        //
        // YYYY - Long year
        // MM - Two digit month
        // DD - Two digit day
        // [A|B] - Single charcter denoting if service is A or B
        //
        const abRxp = new RegExp('^(Routing/)\\d{8}[A|B]$');
        const defaultRxp = new RegExp('^(Routing/)\\d{8}$');

        this._store.allNetworks = res.services
          .filter((s: TripPlannerServiceType) => s.type === 'NAServer')
          .sort()
          .map((s: TripPlannerServiceType) => new TripPlannerConnection({ name: s.name, type: s.type }));

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

        // Compute and store the latest non-A/B network
        this._store.latestNonAbNetwork = latestNonAB();

        // Set the private abNetwork subject value, which triggers observable subscriptions
        this._abNetworks.next(Array.from(this._store.abNetworks));

        // Set the private latestNonAbNetwork subject value, which triggers observable subscriptions
        this._latestNonAbNetwork.next(this._store.latestNonAbNetwork);

        // Select a random AB network and set it as the initial current network
        this.connection();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  /**
   * Selects a randomly selected A/B network from latest.
   *
   * Sets the current network to be the selected A/B network.
   *
   * Returns the selected A/B network.
   *
   * @returns {TripPlannerConnection} RoutingService instance
   * @memberof RoutingConnectionService
   */
  public connection(): TripPlannerConnection {
    if (this._override.value) {
      if (!this._store.currentNetwork.name || !this._store.currentNetwork.type) {
        this._newCurrentNetwork = this._store.latestNonAbNetwork;

        // TODO: Remove this return once new implementation is in place
        return new TripPlannerConnection({
          name: this._store.latestNonAbNetwork.name,
          type: this._store.latestNonAbNetwork.type
        });
      } else {
        this._newCurrentNetwork = this._store.currentNetwork;

        // TODO: Remove this return once new implementation is in place
        return new TripPlannerConnection({
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
          name: this._store.currentNetwork.name,
          type: this._store.currentNetwork.type
        });
      }
    }
  }

  /**
   * Sets the current network by network name reference.
   *
   * @memberof RoutingConnectionService
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
   * `false` will instruct conection() method to return a random a/b network.
   * @memberof TripPlannerConnectionService
   */
  public setOverride(value: boolean) {
    this._override.next(value);
  }

  /**
   * Used internally. Will set the current network value to be a new immutable class instance of
   * RoutingService based on the provided reference object.
   *
   * Will trigger all subscribers to currentNetwork.
   *
   * @private
   * @memberof RoutingConnectionService
   */
  private set _newCurrentNetwork(ref: TripPlannerConnection) {
    // Copy network properties to assign to new immutable;
    const props = Object.assign({}, ref);

    // Create a new immutable class reference
    const connection = new TripPlannerConnection({
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
  type: string;
  name: string;
}

export class TripPlannerConnection {
  public name: string;
  public type: string;

  constructor(props: TripPlannerServiceType) {
    this.name = props.name;
    this.type = props.type;
  }

  /**
   * Returns a constructed URL from its name and type properties.
   *
   * @returns URL
   * @memberof RoutingService
   */
  public url(): string {
    return `https://gis.tamu.edu/arcgis/rest/services/${this.name}/${this.type}/Route`;
  }
}
