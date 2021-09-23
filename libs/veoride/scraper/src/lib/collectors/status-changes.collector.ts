import { StatusChange, MDSStatusChangeDto } from '@tamu-gisc/veoride/common/entities';

import { BaseCollector } from './base.collector';
import { dateDifferenceGreaterThan, mdsTimeHourIncrement, mdsTimeHourToDate } from '../utilities/time.utils';
import {
  BaseCollectorConstructorProperties,
  MDSResponse,
  MDSStatusChangesPayloadDto,
  StatusChangesRequestParams
} from '../types/types';

export class StatusChangeCollector extends BaseCollector<
  StatusChangeCollectorConstructorProperties,
  StatusChangesRequestParams
> {
  constructor(params: StatusChangeCollectorConstructorProperties) {
    super(params);
  }

  public async scrape() {
    if (this.processing === true) {
      console.log('Status Changes: Scrape in progress. Skipping cycle.');
      return;
    }

    this.processing = true;
    try {
      // Get last collected date and hour. Scraping will resume from there.
      const lastCollected = await (await this.getLastCollected(this.params.eventDate)).value;
      const currentCollectionDate = mdsTimeHourIncrement(lastCollected);

      let resource: MDSResponse<MDSStatusChangesPayloadDto>;
      let changes: Array<MDSStatusChangeDto>;

      try {
        resource = await this.resource<MDSStatusChangesPayloadDto>({ event_time: currentCollectionDate });
        changes = resource.data.status_changes;
      } catch (err) {
        console.log(err.message);
        this.processing = false;
        return;
      }

      const newRecords = await this.processRecords<StatusChange, MDSStatusChangeDto>(changes, 'event_time', StatusChange);

      if (newRecords.length === 0) {
        await this.updateLastCollected(currentCollectionDate);
        console.log(`Completed scraping. No new ${this.params.resourceName}s.`);
        this.processing = false;
        return;
      }

      const savedStatusChanges = await this.saveEntities<StatusChange>(StatusChange, newRecords);

      await this.updateLastCollected(currentCollectionDate);
      console.log(`Completed scraping. Saved ${savedStatusChanges.length} ${this.params.resourceName}s.`);
      this.processing = false;

      // After status changes have been recorded, check to see if the time offset between "now" and the collection date time.
      // If the difference is greater than an hour, then it means there are more hours ahead of the current collection date to check
      // and should self call the scrape function again.
      if (dateDifferenceGreaterThan(new Date(), mdsTimeHourToDate(currentCollectionDate, true), 1, 'hours')) {
        this.scrape();
      }
    } catch (err) {
      console.log(`Error scraping ${this.params.resourceName}s`, err);
    }
  }

  public dtoToEntity(dto) {
    const sc = StatusChange.fromDto(dto);

    return sc;
  }
}

export interface StatusChangeCollectorConstructorProperties extends BaseCollectorConstructorProperties {
  eventDate: string;
}
