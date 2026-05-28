import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { EventConfiguration } from '@tamu-gisc/ts/events/ngx';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { DiscoverComponent } from './discover.component';
import { InternalDiscoverApplication } from '../interfaces/discover-application.interface';
import { DiscoveryService } from '../services/discovery/discovery.service';

describe('DiscoverComponent', () => {
  let component: DiscoverComponent;
  let fixture: ComponentFixture<DiscoverComponent>;

  const internalApplications: InternalDiscoverApplication[] = [
    createInternalApplication('accessible-parking', 'Accessible Parking', 'parking', 'parking', '2000-04-12'),
    createInternalApplication('move-in', 'Move In', 'campus', 'event', '2099-03-29'),
    createInternalApplication('football-parking', 'Football Parking', 'athletics', 'event', '2099-09-05'),
    createInternalApplication('construction-map', 'Construction Map', 'operations', 'parking', '2000-04-12')
  ];

  beforeEach(async () => {
    window.history.replaceState(window.history.state, '', '/discover');

    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, RouterTestingModule],
      declarations: [DiscoverComponent],
      providers: [
        {
          provide: DiscoveryService,
          useValue: {
            getInternalDiscoverApplications: jest.fn(() => internalApplications),
            getExternalDiscoverApplications: jest.fn(() => []),
            getAllDiscoverApplications: jest.fn(() => internalApplications)
          }
        },
        {
          provide: TestingService,
          useValue: {
            get: jest.fn(() => of(false))
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DiscoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    window.history.replaceState(window.history.state, '', '/discover');
  });

  it('renders the parking tab by default and switches the visible panel on click', () => {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const tabButtons = Array.from(nativeElement.querySelectorAll<HTMLButtonElement>('.discover-tab'));

    expect(tabButtons.map((button) => button.textContent?.trim())).toEqual([
      'Parking Maps',
      'Campus Events',
      'Athletic Events',
      'Operations Maps'
    ]);
    expect(component.activeTab).toBe('parking');
    expect(getPanelHeading()).toBe('Parking Maps');
    expect(getPanelText()).toContain('Accessible Parking');

    tabButtons[3].click();
    fixture.detectChanges();

    expect(component.activeTab).toBe('operations');
    expect(getPanelHeading()).toBe('Operations Maps');
    expect(getPanelText()).toContain('Construction Map');
    expect(getPanelText()).not.toContain('Accessible Parking');
    expect(window.location.hash).toBe('#discover-tab-campus');
  });

  it('opens the requested tab from the discover tab hash', () => {
    fixture.destroy();
    window.history.replaceState(window.history.state, '', '/discover#discover-tab-athletics');

    fixture = TestBed.createComponent(DiscoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.activeTab).toBe('athletics');
    expect(getPanelHeading()).toBe('Athletic Events');
    expect(getPanelText()).toContain('Football Parking');
  });

  it('updates the visible panel when the hash changes after load', () => {
    window.history.replaceState(window.history.state, '', '/discover#discover-tab-athletics');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    fixture.detectChanges();

    expect(component.activeTab).toBe('athletics');
    expect(getPanelHeading()).toBe('Athletic Events');
  });

  function getPanelHeading() {
    const nativeElement = fixture.nativeElement as HTMLElement;
    return nativeElement.querySelector('.discover-tab-panel h2')?.textContent?.trim();
  }

  function getPanelText() {
    const nativeElement = fixture.nativeElement as HTMLElement;
    return nativeElement.querySelector('.discover-tab-panel')?.textContent ?? '';
  }
});

function createInternalApplication(
  id: string,
  name: string,
  mapType: InternalDiscoverApplication['mapType'],
  type: InternalDiscoverApplication['type'],
  eventDate: string
): InternalDiscoverApplication {
  const configuration: EventConfiguration = {
    id,
    name,
    applicationName: name,
    shortApplicationName: name,
    eventDates: [eventDate]
  };

  return {
    id,
    name,
    description: `${name} description`,
    source: 'internal',
    type,
    mapType,
    configuration
  };
}
