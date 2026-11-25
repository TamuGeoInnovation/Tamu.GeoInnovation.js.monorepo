import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

import { ParkingLotPopupComponent } from './parking-lot.component';

describe('ParkingLotPopupComponent', () => {
  let component: ParkingLotPopupComponent;
  let fixture: ComponentFixture<ParkingLotPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingLotPopupComponent],
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
            getSource: vi.fn().mockReturnValue({
              urlQueryParam: 'lot'
            })
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParkingLotPopupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.data = {
      attributes: {
        name: '100'
      }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  // A lot's fields are lower case: it comes from the surface lots service (#2722). The garage popup shares this
  // template with `LotName`, which `parking-garage.component.spec.ts` covers.
  it('shows the lot name', () => {
    component.data = { attributes: { lotname: 'Lot 077', name: '77' } } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Lot 077');
  });

  it('should prefer lotname when name is null for copied share urls', () => {
    component.data = {
      attributes: {
        name: null,
        lotname: 'Post Office Lot'
      }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(component.shareUrl).toBe('http://localhost/?lot=Post Office Lot');
  });

  it('should fall back to name when lotname is unavailable', () => {
    component.data = {
      attributes: {
        name: '100a',
        lotname: null
      }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(component.shareUrl).toBe('http://localhost/?lot=100a');
  });
});
