import { DeepPartial } from 'typeorm';

export interface UpdateEventDto extends Omit<DeepPartial<Event>, 'tags' | 'speakers' | 'judges'> {
  tags: Array<string>;
  speakers: Array<string>;
  /** The speakers who judge its competition (#3183), by id: each must be one of `speakers`. Unchanged when not sent. */
  judges?: Array<string>;
  /** The competition its judges score (#3183), or null for none. */
  judgedCompetition?: string | null;
  /** Whether its judges can no longer change their scores (#3183). */
  judgingClosed?: boolean;
}
