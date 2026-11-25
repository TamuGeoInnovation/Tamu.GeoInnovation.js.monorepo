import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

import { ParkingGaragePopupComponent } from './parking-garage.component';

describe('ParkingGaragePopupComponent', () => {
  let component: ParkingGaragePopupComponent;
  let fixture: ComponentFixture<ParkingGaragePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingGaragePopupComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: vi.fn()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {}
        },
        {
          provide: TripPlannerService,
          useValue: {
            Stops: of([]),
            setStops: vi.fn()
          }
        },
        {
          provide: Angulartics2,
          useValue: {
            eventTrack: {
              next: vi.fn()
            }
          }
        },
        {
          provide: EsriMapService,
          useValue: {
            clearHitTest: vi.fn()
          }
        },
        {
          provide: SearchService,
          useValue: {
            // Share links are built from the garage search source, not the parking lot one.
            getSource: vi.fn((id: string) => (id === 'parking-garage' ? { urlQueryParam: 'garage' } : undefined))
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParkingGaragePopupComponent);
    component = fixture.componentInstance;
  });

  // The three cases below use the retired raster layer's fields. They are kept deliberately after #3425: they
  // prove a feature still held from that layer renders rather than showing an empty heading, which is #1163.
  it('shows the garage name from the retired layer, which the building popup could not', () => {
    component.data = {
      attributes: { LotName: 'Central Campus Garage', Name: 'CCG', FAC_CODE: 'CCG' }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Central Campus Garage');
  });

  it('shares a ?garage= link by garage code, since garages are not in the parking lots layer', () => {
    component.data = {
      attributes: { LotName: 'Central Campus Garage', Name: 'CCG' }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(component.shareUrl).toBe('http://localhost/?garage=CCG');
  });

  it('falls back to the garage name when there is no code', () => {
    component.data = {
      attributes: { LotName: 'Park West Garage', Name: null }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(component.shareUrl).toBe('http://localhost/?garage=Park West Garage');
  });

  it('shows the garage name from Campus Structures, where the garages live since #3425', () => {
    component.data = {
      attributes: { bldgname: 'Central Campus Parking Garage', bldgabbrev: 'CCG', number: '0469' }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Central Campus Parking Garage');
  });

  it('shares a ?garage= link by bldgabbrev, so a link made before #3425 still resolves', () => {
    component.data = {
      attributes: { bldgname: 'Central Campus Parking Garage', bldgabbrev: 'CCG', number: '0469' }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(component.shareUrl).toBe('http://localhost/?garage=CCG');
  });

  // The service pads this field: PC26, PC27 and PW GAR all come back with trailing spaces, measured
  // 24 November 2026. Without trimming, every one of those links carries %20s and finds nothing - which is
  // three of the eleven garages, including the one Transportation calls Residents Garage.
  it('trims a space-padded bldgabbrev, which the service returns for three of the garages', () => {
    component.data = {
      attributes: { bldgname: 'Century Square Parking Deck', bldgabbrev: 'PC27                    ' }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(component.shareUrl).toBe('http://localhost/?garage=PC27');
  });

  it('falls back to the building number when a garage row carries no name or code', () => {
    component.data = {
      attributes: { bldgname: null, bldgabbrev: null, number: 'Y316' }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(component.shareUrl).toBe('http://localhost/?garage=Y316');
  });
});
