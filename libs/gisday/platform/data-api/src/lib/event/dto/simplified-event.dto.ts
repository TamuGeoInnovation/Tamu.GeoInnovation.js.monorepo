import { Event } from '../../entities/all.entity';

/**
 * A partial Event DTO that has `organizations` and `tags` as root-level properties,
 * themselves being a list of guids for the respective entities.
 *
 * This to avoid having to deep nesting and filtering on the client-side.
 */
export interface SimplifiedEvent extends Omit<Partial<Event>, 'organizations' | 'tags'> {
  organizations?: Array<string>;
  tags?: Array<string>;

  /**
   * Guids of the organizations the event's speakers belong to.
   *
   * `SeasonDayService.getDayEvents` sets this on every event it returns and declares its return
   * type as `SimplifiedEvent`, but the property was not declared here -- so the type did not
   * describe the payload and a consumer would have had to cast to reach it. Nothing reads it
   * today; declaring it is what makes the return type honest.
   */
  affiliations?: Array<string>;
}
