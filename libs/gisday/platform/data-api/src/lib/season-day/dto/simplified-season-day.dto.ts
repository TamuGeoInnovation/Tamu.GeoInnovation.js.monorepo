import { SeasonDay } from '../../entities/all.entity';
import { SimplifiedEvent } from '../../event/dto/simplified-event.dto';

/**
 * A partial SeasonDay DTO that replaces the `events` property with a list of SimplifiedEvent DTOs.
 */
export interface SimplifiedSeasonDay extends Omit<Partial<SeasonDay>, 'events'> {
  events: Array<SimplifiedEvent>;
}
