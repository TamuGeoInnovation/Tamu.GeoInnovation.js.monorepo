import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { InternalDiscoverApplication } from '../../interfaces/discover-application.interface';
import { MapColumnsComponent } from './map-columns.component';

/**
 * The listing that serves `/all-maps/campus` draws the picture a map declares.
 *
 * This component is the one behind that route - All Maps is a different component. The campus
 * pictures were added to All Maps alone, so the Campus Maps page, the page they were added for, drew
 * a name over an empty area and every check still passed (#1275). Nothing asserted on the markup the
 * route actually renders, which is what this does.
 */

function application(overrides: Partial<InternalDiscoverApplication> = {}): InternalDiscoverApplication {
  return {
    id: 'galveston',
    name: 'Galveston',
    description: '',
    source: 'internal',
    type: 'satellite-campus',
    mapTypes: ['campus'],
    configuration: {
      id: 'galveston',
      name: 'Galveston',
      applicationName: 'Aggie Map - Galveston',
      shortApplicationName: 'Galveston',
      eventDates: []
    },
    ...overrides
  } as InternalDiscoverApplication;
}

describe('MapColumnsComponent pictures', () => {
  let fixture: ComponentFixture<MapColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule, MapColumnsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MapColumnsComponent);
  });

  function render(apps: InternalDiscoverApplication[]): HTMLElement {
    fixture.componentInstance.columns = [{ id: 'column-1', applications: apps }];
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('draws the picture a map declares', () => {
    const element = render([application({ thumbnail: './assets/images/campus/galveston.jpg' })]);
    const image = element.querySelector('img.map-entry-thumbnail') as HTMLImageElement | null;

    expect(image).not.toBeNull();
    expect(image?.getAttribute('src')).toBe('./assets/images/campus/galveston.jpg');
  });

  it('describes the picture by the map it shows, for anyone not looking at it', () => {
    const element = render([application({ thumbnail: './assets/images/campus/galveston.jpg' })]);
    const image = element.querySelector('img.map-entry-thumbnail');

    expect(image?.getAttribute('alt')).toBe('Galveston map');
  });

  it('keeps the glyph for a map with no picture, rather than leaving a gap', () => {
    // Every other listing - parking, events, operations, the 150th - shares this component and has no
    // thumbnails. They must be untouched by this.
    const element = render([application({ id: 'fire-school', name: 'Fire School' })]);

    expect(element.querySelector('img.map-entry-thumbnail')).toBeNull();
    expect(element.querySelector('.map-entry-icon')).not.toBeNull();
  });

  it('stacks only the entries that carry a picture', () => {
    const element = render([
      application({ thumbnail: './assets/images/campus/galveston.jpg' }),
      application({ id: 'fire-school', name: 'Fire School' })
    ]);
    const entries = Array.from(element.querySelectorAll('.map-entry'));

    expect(entries.length).toBe(2);
    expect(entries[0].classList.contains('map-entry--pictured')).toBe(true);
    expect(entries[1].classList.contains('map-entry--pictured')).toBe(false);
  });
});
