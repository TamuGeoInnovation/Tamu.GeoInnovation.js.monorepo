import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2 } from 'angulartics2';
import { firstValueFrom, of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { LastMapService } from '@tamu-gisc/aggiemap/ngx/common';

import { DiscoveryService } from '../../services/discovery/discovery.service';
import { discoveryServiceStub } from '../../services/discovery/discovery.service.stub';
import { AllMapsComponent } from './all-maps.component';

/**
 * What the All Maps search offers, on each environment (#1704).
 *
 * The search returned every map unfiltered on development, so a map with `visible: false` - the undated Move Out, kept
 * only so its old links resolve - was offered there beside its three dated periods, and development stopped showing
 * what production would. `visible: false` now means "not in the listings" everywhere; a development-only map is still
 * offered on development alone.
 */
describe('AllMapsComponent search', () => {
  const map = (id: string, extra: Record<string, unknown> = {}) => ({
    id,
    name: id,
    source: 'internal',
    type: 'event',
    mapTypes: ['campus'],
    description: '',
    configuration: { id, eventDates: [] },
    ...extra
  });

  const published = map('spring-move-out');
  const unlisted = map('move-out', { visible: false });
  const developmentOnly = map('ncaa-volleyball', { developmentOnly: true });

  const offeredOn = async (isDev: boolean): Promise<string[]> => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, AllMapsComponent],
      providers: [
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } },
        {
          provide: DiscoveryService,
          useValue: discoveryServiceStub({ getAllDiscoverApplications: () => [published, unlisted, developmentOnly] })
        },
        { provide: TestingService, useValue: { get: () => of(isDev) } },
        { provide: LastMapService, useValue: { url: '/map', path: '/map', queryParams: {}, fragment: undefined } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const fixture = TestBed.createComponent(AllMapsComponent);

    fixture.detectChanges();

    return (await firstValueFrom(fixture.componentInstance.filteredApplications)).map((app) => app.id);
  };

  afterEach(() => TestBed.resetTestingModule());

  it('does not offer a map with visible: false on development', async () => {
    expect(await offeredOn(true)).toEqual(['spring-move-out', 'ncaa-volleyball']);
  });

  it('does not offer a map with visible: false, or a development-only map, on production', async () => {
    expect(await offeredOn(false)).toEqual(['spring-move-out']);
  });
});
