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
      declarations: [ParkingLotPopupComponent],
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
            getSource: jest.fn().mockReturnValue({
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
        Name: '100'
      }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should prefer LotName when Name is null for copied share urls', () => {
    component.data = {
      attributes: {
        Name: null,
        LotName: 'Post Office Lot'
      }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(component.shareUrl).toBe('http://localhost/?lot=Post Office Lot');
  });

  it('should fall back to Name when LotName is unavailable', () => {
    component.data = {
      attributes: {
        Name: '100a',
        LotName: null
      }
    } as unknown as __esri.Graphic;

    fixture.detectChanges();

    expect(component.shareUrl).toBe('http://localhost/?lot=100a');
  });
});
