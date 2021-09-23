import { In } from 'typeorm';

import { PersistanceRecord, Trip } from '@tamu-gisc/veoride/common/entities';

import { BaseCollector, BaseCollectorConstructorProperties, BaseRequestParams, MDSResponse } from './base.collector';
import { dateDifferenceGreaterThan, mdsTimeHourIncrement, mdsTimeHourToDate } from '../utilities/time.utils';

export class TripCollector extends BaseCollector<TripCollectorConstructorProperties, TripRequestParams> {
  public processing = false;

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
      const lastCollected = await (await this.getLastCollected()).value;
      const currentCollectionDate = mdsTimeHourIncrement(lastCollected);

      console.log(`Scraping trips for ${currentCollectionDate}`);

      let resource: MDSResponse<MDSTripsPayloadDto>;
      let trips: Array<MDSTripDto>;

      try {
        resource = await this.resource<MDSTripsPayloadDto>({ end_time: currentCollectionDate });
        trips = resource.data.trips;
      } catch (err) {
        if (err.response.statusCode === 404) {
          console.log(`Requested date time ${currentCollectionDate} does not yet exist. Aborting scraping cycle.`);
        } else if (err.response.statusCode === 401) {
          console.log(`Authentication token invalid.`);
        } else {
          console.log('Error requesting trips resource');
        }

        return;
      }

      // Filter out the trip id's to check against database for existing trips.
      const tripGuids = trips.map((t) => t.trip_id);

      const dbExistingTrips = await Trip.find({
        where: {
          trip_id: In(tripGuids)
        }
      });

      // Filter out existing db trips. Only the resulting trips will be inserted.
      const newTrips = trips
        .filter((t) => {
          return dbExistingTrips.findIndex((dbet) => dbet.trip_id === t.trip_id) === -1;
        })
        .map((t) => this.dtoToEntity(t));

      if (newTrips.length === 0) {
        await this.updateLastCollected(currentCollectionDate);
        console.log('Completed scraping. No new trips.');
        this.processing = false;
        return;
      }

      // Parameter limit per query is ~2000. Batch the entry submissions to not exceed that parameter limit.
      const chunk = Object.entries(newTrips[0]).length / 2000;
      const savedTrips = await Trip.save(newTrips, { chunk });

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

  private dtoToEntity(dto: MDSTripDto) {
    const trip = new Trip();

    trip.trip_id = dto.trip_id;
    trip.provider_id = dto.provider_id;
    trip.provider_name = dto.provider_name;
    trip.start_time = dto.start_time;
    trip.end_time = dto.end_time;
    trip.propulsion_types = dto.propulsion_types.toString();
    trip.trip_distance = dto.trip_distance;
    trip.trip_duration = dto.trip_duration;
    trip.vehicle_id = dto.vehicle_id;
    trip.vehicle_type = dto.vehicle_type;
    trip.route = dto.route;
    trip.device_id = dto.device_id;
    trip.accuracy = dto.accuracy;

    return trip;
  }

  /**
   * Updates the persistent value for the trips resource, recording the last scraped time.
   */
  private async updateLastCollected(collectedDateTime: string) {
    const last = mdsTimeHourToDate(collectedDateTime, true);

    // If the difference between now and the last scraped date time is greater than 1 hour, there is no need to re-check
    // that interval. In that case, we can set the last collected date time to be the provided timestamp so that
    // the next scraping cycle checks for the next interval.
    //
    // If the difference is not greater than an hour, do not update the last checked date time so that date time can be checked
    // again for recent trips.
    if (dateDifferenceGreaterThan(new Date(), last, 1, 'hours')) {
      return PersistanceRecord.update(this.params.persistanceKey, { value: collectedDateTime });
    } else {
      return;
    }
  }

  /**
   * Return the persistance record for trips. Used to resume scraping on application start or on timed scrape cycle.
   */
  private getLastCollected() {
    return PersistanceRecord.findOrCreate(this.params.persistanceKey, this.params.startDate);
  }
}

export interface TripCollectorConstructorProperties extends BaseCollectorConstructorProperties {
  startDate: string;
}

export interface TripRequestParams extends BaseRequestParams {
  /**
   * Date time string representing the hour of data to be scraped.
   *
   * Per the MDS specification, only one hour at a time can be requested.
   */
  end_time: string;
}

export interface MDSTripsPayloadDto {
  trips: Array<MDSTripDto>;
}

export interface MDSTripDto extends Omit<Trip, 'propulsion_types'> {
  propulsion_types: Array<string>;
}
