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
                navigate: jest.fn()
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
                setStops: jest.fn()
            }
        },
        {
            provide: Angulartics2,
            useValue: {
                eventTrack: {
                    next: jest.fn()
                }
            }
        },
        {
            provide: EsriMapService,
            useValue: {
                clearHitTest: jest.fn()
            }
        },
        {
            provide: SearchService,
            useValue: {
                // Share links are built from the garage search source, not the parking lot one.
                getSource: jest.fn((id: string) => (id === 'parking-garage' ? { urlQueryParam: 'garage' } : undefined))
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

  it('shows the garage name, which the building popup could not', () => {
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
});
