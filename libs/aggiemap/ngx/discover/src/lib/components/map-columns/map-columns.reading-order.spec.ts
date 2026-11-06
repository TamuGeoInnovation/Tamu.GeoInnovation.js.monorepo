import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { InternalDiscoverApplication } from '../../interfaces/discover-application.interface';
import { buildMapColumnGroups, sortApplicationsByName } from '../discover.utils';
import { MapColumnsComponent } from './map-columns.component';

/**
 * A layout split reads across its rows, not down its columns (#2681).
 *
 * The campuses were sorted correctly and arrived on screen as DC / Bush School, HSC College of
 * Dentistry, HSC Round Rock - because the sorted list was cut into three sequential chunks and the
 * chunks were rendered side by side, so alphabetical order ran *down* each column while a reader ran
 * across each row. Nothing caught it: the data was sorted, the markup was in order, and only a
 * picture of the page showed it, the same way #1055's duplicated tile was found.
 *
 * A DOM-order assertion could not have caught it either - three lists in order concatenate to the
 * same order as one list. What distinguishes them is the **structure**: a split is one list in a grid
 * that flows across, so the grid places the second item beside the first instead of beneath it.
 * That is what this asserts, with the order alongside it.
 */

function application(name: string): InternalDiscoverApplication {
  const id = name.toLowerCase().replace(/[^a-z]+/g, '-');

  return {
    id,
    name,
    description: '',
    source: 'internal',
    type: 'satellite-campus',
    mapTypes: ['campus'],
    configuration: { id, name, applicationName: name, shortApplicationName: name, eventDates: [] }
  } as InternalDiscoverApplication;
}

/** The campuses as they are registered, which is not alphabetical - the order the page starts from. */
const REGISTERED = [
  'Galveston',
  'McAllen',
  'DC / Bush School',
  'HSC Round Rock',
  'Fort Worth Law School',
  'Houston Space Institute',
  'HSC Kingsville',
  'Mays City Center',
  'HSC Corpus Christi',
  'HSC College of Dentistry'
];

describe('map columns reading order (#2681)', () => {
  let fixture: ComponentFixture<MapColumnsComponent>;

  const labels = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.map-entry-label')).map((element: Element) =>
      element.textContent.trim()
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule, MapColumnsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MapColumnsComponent);
  });

  function render(columns: ReturnType<typeof buildMapColumnGroups>) {
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('getApplicationRoute', (app: InternalDiscoverApplication) => ['/all-maps', app.id]);
    fixture.detectChanges();
  }

  it('renders a layout split as one list, so the grid flows across the rows', () => {
    render(buildMapColumnGroups(sortApplicationsByName(REGISTERED.map(application))));

    expect(fixture.nativeElement.querySelectorAll('ul').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.parking-columns').length).toBe(0);
  });

  it('keeps the campuses in alphabetical order', () => {
    render(buildMapColumnGroups(sortApplicationsByName(REGISTERED.map(application))));

    expect(labels()).toEqual([...REGISTERED].sort((a, b) => a.localeCompare(b)));
  });

  /**
   * A titled column is a real section, not a layout split: its heading gives it meaning, so it keeps
   * its own list and its own order.
   */
  it('leaves titled columns as separate lists', () => {
    const apps = sortApplicationsByName(REGISTERED.map(application));
    const columns = buildMapColumnGroups(apps, [
      { id: 'fall', heading: 'Fall' },
      { id: 'spring', heading: 'Spring' }
    ]);

    render(columns);

    expect(fixture.nativeElement.querySelectorAll('.parking-columns').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.parking-column-heading').length).toBeGreaterThan(0);
  });
});
