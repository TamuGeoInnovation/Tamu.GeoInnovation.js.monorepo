import { Trip, MDSTripDto } from '@tamu-gisc/veoride/common/entities';

import { BaseCollector } from './base.collector';
import { dateDifferenceGreaterThan, mdsTimeHourIncrement, mdsTimeHourToDate } from '../utilities/time.utils';
import { BaseCollectorConstructorProperties, MDSResponse, MDSTripsPayloadDto, TripRequestParams } from '../types/types';

export class TripCollector extends BaseCollector<TripCollectorConstructorProperties, TripRequestParams> {
  constructor(params: TripCollectorConstructorProperties) {
    super(params);
  }

  public async scrape() {
    if (this.processing === true) {
      console.log('Scrape in progress. Skipping cycle.');
      return;
    }

    this.processing = true;
    try {
      // Get last collected date and hour. Scraping will resume from there.
      const lastCollected = await (await this.getLastCollected(this.params.startDate)).value;
      const currentCollectionDate = mdsTimeHourIncrement(lastCollected);

      console.log(`Scraping trips for ${currentCollectionDate}`);

      let resource: MDSResponse<MDSTripsPayloadDto>;
      let trips: Array<MDSTripDto>;

      try {
        resource = await this.resource<MDSTripsPayloadDto>({ end_time: currentCollectionDate });
        trips = resource.data.trips;
      } catch (err) {
        console.log(err.message);
        this.processing = false;
        return;
      }

      const newRecords = await this.processRecords<Trip, MDSTripDto>(trips, 'trip_id', Trip);

      if (newRecords.length === 0) {
        await this.updateLastCollected(currentCollectionDate);
        console.log('Completed scraping. No new trips.');
        this.processing = false;
        return;
      }

      const savedTrips = await this.saveEntities<Trip>(Trip, newRecords);

      await this.updateLastCollected(currentCollectionDate);
      console.log(`Completed scraping. Saved ${savedTrips.length} trips.`);
      this.processing = false;

      // After trips have been recorded, check to see if the time offset between "now" and the collection date time.
      // If the difference is greater than an hour, then it means there are more hours ahead of the current collection date to check
      // and should self call the scrape function again.
      if (dateDifferenceGreaterThan(new Date(), mdsTimeHourToDate(currentCollectionDate, true), 1, 'hours')) {
        this.scrape();
      }
    } catch (err) {
      console.log(`Error scraping trips`, err);
    }
  }

  public dtoToEntity(dto) {
    const trip = Trip.fromDto(dto);

    return trip;
  }
}

export interface TripCollectorConstructorProperties extends BaseCollectorConstructorProperties {
  startDate: string;
}
