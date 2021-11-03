import { DateTime } from 'luxon';

import {
  StatusChange,
  MDSStatusChangeDto,
  Log,
  LogType,
  dateDifferenceGreaterThan,
  mdsTimeHourIncrement,
  mdsTimeHourToDate,
  ResourceType,
  dateToMdsTimeHour
} from '@tamu-gisc/veoride/common/entities';

import { BaseMdsCollector } from './base-mds.collector';
import {
  AbstractCollectorConstructorProperties,
  MDSResponse,
  MDSStatusChangesPayloadDto,
  StatusChangesRequestParams
} from '../types/types';

export class StatusChangeCollector extends BaseMdsCollector<
  StatusChangeCollectorConstructorProperties,
  StatusChangesRequestParams
> {
  constructor(params: StatusChangeCollectorConstructorProperties) {
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
      let lastCollected = await (await this.getLastCollected(ResourceType.STATUS_CHANGE))?.collectedTime;

      if (!lastCollected) {
        lastCollected = this.params.eventDate;
      } else {
        lastCollected = dateToMdsTimeHour(DateTime.fromMillis(parseInt(lastCollected, 10)).toJSDate(), true);
      }

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

      const newRecords = await this.processRecords<StatusChange, MDSStatusChangeDto>(changes);

      if (newRecords.length === 0) {
        await this.updateLastCollected(currentCollectionDate, newRecords.length);

        console.log(`${this.headingResourceName}: Completed scraping. No new ${this.params.resourceName}s.`);
        this.processing = false;
      } else {
        const savedStatusChanges = await this.saveEntities<StatusChange>(StatusChange, newRecords);

        await this.updateLastCollected(currentCollectionDate, savedStatusChanges.length);

        console.log(`${this.headingResourceName}: Completed scraping. Saved ${savedStatusChanges.length} rows`);
        this.processing = false;
      }

      // After status changes have been recorded, check to see if the time offset between "now" and the collection date time.
      // If the difference is greater than an hour, then it means there are more hours ahead of the current collection date to check
      // and should self call the scrape function again.
      if (dateDifferenceGreaterThan(new Date(), mdsTimeHourToDate(currentCollectionDate, true), 1, 'hours')) {
        this.scrape();
      } else {
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
    const sc = StatusChange.fromDto(dto);

    return sc;
  }
}

export interface StatusChangeCollectorConstructorProperties extends AbstractCollectorConstructorProperties {
  eventDate: string;
}
