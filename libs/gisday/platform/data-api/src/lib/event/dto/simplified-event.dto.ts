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
}
