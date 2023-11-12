import { DeepPartial } from 'typeorm';

export interface UpdateEventDto extends Omit<DeepPartial<Event>, 'tags' | 'speakers'> {
  tags: Array<string>;
  speakers: Array<string>;
}
