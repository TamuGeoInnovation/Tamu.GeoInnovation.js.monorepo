import { Log, LogType, MDSVehicleDto, Vehicle } from '@tamu-gisc/veoride/common/entities';

import { AbstractCollectorConstructorProperties, MDSResponse, MDSVehiclesPayloadDto } from '../types/types';
import { AbstractMdsCollector } from './abstract-mds.collector';

export class VehicleCollector extends AbstractMdsCollector<VehicleCollectorConstructorProperties, undefined> {
  constructor(params: VehicleCollectorConstructorProperties) {
    super(params);
  }

  public init() {
    setTimeout(async () => {
      this.scrape();
    }, 3000);

    setInterval(async () => {
      this.scrape();
    }, this.params.interval * 60 * 1000);
  }

  public async scrape() {
    if (this.processing === true) {
      console.log(`${this.headingResourceName}: Scrape in progress. Skipping job.`);
      return;
    }

    this.processing = true;
    try {
      let resource: MDSResponse<MDSVehiclesPayloadDto>;
      let vehicles: Array<MDSVehicleDto>;

      try {
        resource = await this.resource<MDSVehiclesPayloadDto>();
        vehicles = resource.data.vehicles;

        console.log(`${this.headingResourceName}: Fetched ${vehicles.length} ${this.params.resourceName}s`);

        const savedVehicles = await this.saveEntities<Vehicle>(
          Vehicle,
          vehicles.map((v) => this.dtoToEntity(v))
        );

        console.log(`${this.headingResourceName}: Completed scraping. Saved/updated ${savedVehicles.length} rows.`);
        this.processing = false;
        Log.record({
          resource: this.params.resourceName,
          type: LogType.INFO,
          category: 'scrape-complete',
          collectedTime: Date.now(),
          count: savedVehicles.length
        });
      } catch (err) {
        console.log(err.message);
        this.processing = false;
        return;
      }
    } catch (err) {
      console.log(`${this.headingResourceName}: Error scraping resource`, err);
      this.processing = false;
      Log.record({
        resource: this.params.resourceName,
        type: LogType.ERROR,
        category: 'scrape-abort',
        message: err.message
      });
    }
  }

  public dtoToEntity(dto) {
    const vehicle = Vehicle.fromDto(dto);

    return vehicle;
  }
}

export type VehicleCollectorConstructorProperties = AbstractCollectorConstructorProperties;
