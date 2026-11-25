import { FormControl, FormGroup } from '@angular/forms';

import { formToFormData } from './form-to-form-data';

/**
 * A checkbox turned off on an admin form was never sent, because every false value was left out (#3327). The API reads
 * a "false" as false: the speaker's `isOrganizer` and `isActive` compare with "true", and the sponsor's `active` takes
 * "true" or "false" and leaves anything else as it was.
 */
describe('formToFormData()', () => {
  it('sends a checkbox that is off as false, and one that is on as true', () => {
    const data = formToFormData(
      new FormGroup({
        name: new FormControl('Made-up Speaker'),
        isOrganizer: new FormControl(false),
        isActive: new FormControl(true)
      })
    );

    expect(data.get('isOrganizer')).toBe('false');
    expect(data.get('isActive')).toBe('true');
    expect(data.get('name')).toBe('Made-up Speaker');
  });

  it('sends a false inside a group too', () => {
    const data = formToFormData(new FormGroup({ links: new FormGroup({ shown: new FormControl(false) }) }));

    expect(data.get('shown')).toBe('false');
  });

  it('still leaves out an empty or missing value, and a control named with a leading _', () => {
    const data = formToFormData(
      new FormGroup({ blank: new FormControl(''), none: new FormControl(null), _omitted: new FormControl(false) })
    );

    expect([...(data as unknown as { keys(): Iterable<string> }).keys()]).toEqual([]);
  });
});
