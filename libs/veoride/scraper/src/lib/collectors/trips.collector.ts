import { DateTime } from 'luxon';

import {
  Trip,
  MDSTripDto,
  Log,
  LogType,
  dateDifferenceGreaterThan,
  mdsTimeHourIncrement,
  mdsTimeHourToDate,
  ResourceType,
  dateToMdsTimeHour
} from '@tamu-gisc/veoride/common/entities';

import { BaseMdsCollector } from './base-mds.collector';
import { AbstractCollectorConstructorProperties, MDSResponse, MDSTripsPayloadDto, TripRequestParams } from '../types/types';

export class TripCollector extends BaseMdsCollector<TripCollectorConstructorProperties, TripRequestParams> {
  constructor(params: TripCollectorConstructorProperties) {
    super(params);
  }

  public async scrape() {
    if (this.processing === true) {
      console.log(`${this.headingResourceName}: Scrape in progress. Skipping job.`);
      return;
    }

    this.processing = true;
    try {
      // Get last collected date and hour. Scraping will resume from there.
      let lastCollected = await (await this.getLastCollected(ResourceType.TRIP))?.collectedTime;

      if (!lastCollected) {
        lastCollected = this.params.startDate;
      } else {
        lastCollected = dateToMdsTimeHour(DateTime.fromMillis(parseInt(lastCollected, 10)).toJSDate(), true);
      }

      const currentCollectionDate = mdsTimeHourIncrement(lastCollected);

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

      const newRecords = await this.processRecords<Trip, MDSTripDto>(trips);

      if (newRecords.length === 0) {
        await this.updateLastCollected(currentCollectionDate, newRecords.length);
        console.log(`${this.headingResourceName}: Completed scraping. No new ${this.params.resourceName}s.`);
        this.processing = false;

        if (dateDifferenceGreaterThan(new Date(), mdsTimeHourToDate(currentCollectionDate, true), 1, 'hours')) {
          this.scrape();
        }

        return;
      }

      const savedTrips = await this.saveEntities<Trip>(Trip, newRecords);

      await this.updateLastCollected(currentCollectionDate, savedTrips.length);

      console.log(`${this.headingResourceName}: Completed scraping. Saved ${savedTrips.length} rows.`);
      this.processing = false;

      // After trips have been recorded, check to see if the time offset between "now" and the collection date time.
      // If the difference is greater than an hour, then it means there are more hours ahead of the current collection date to check
      // and should self call the scrape function again.
      if (dateDifferenceGreaterThan(new Date(), mdsTimeHourToDate(currentCollectionDate, true), 1, 'hours')) {
        this.scrape();
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
    const trip = Trip.fromDto(dto);

    return trip;
  }
}

export interface TripCollectorConstructorProperties extends AbstractCollectorConstructorProperties {
  startDate: string;
}
