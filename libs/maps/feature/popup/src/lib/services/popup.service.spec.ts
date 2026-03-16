import { TestBed } from '@angular/core/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { HitTestSnapshot } from '@tamu-gisc/maps/esri';

import { PopupService } from './popup.service';

describe('PopupService', () => {
  let service: PopupService;

  class TestPopupComponent {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PopupService,
        {
          provide: EnvironmentService,
          useValue: {}
        }
      ]
    });

    service = TestBed.inject(PopupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve popup data independently by default', () => {
    const snapshot = {
      graphics: [
        {
          attributes: {
            'GIS.TS.ParkingLots.Name': 'Lot 100',
            'GIS.TS.SpacePnt_Count.Total': 200
          },
          layer: {
            id: 'parking-lots',
            title: 'Parking Lots',
            popupComponent: TestPopupComponent,
            popupData: {
              name: {
                field: 'GIS.TS.ParkingLots.Name',
                collapsed: true
              },
              total: {
                field: 'GIS.TS.SpacePnt_Count.Total',
                collapsed: true
              },
              description: '{attributes.name}: {attributes.total}'
            }
          }
        }
      ]
    } as unknown as HitTestSnapshot;

    const result = service.getComponent(snapshot);

    expect(result?.component).toBe(TestPopupComponent);
    expect(result?.data.attributes.name).toBe('Lot 100');
    expect(result?.data.attributes.total).toBe(200);
    expect(result?.data.attributes.description).toBe('{attributes.name}: {attributes.total}');
  });

  it('should resolve popup data cumulatively when configured', () => {
    const snapshot = {
      graphics: [
        {
          attributes: {
            'GIS.TS.ParkingLots.Name': 'Lot 100',
            'GIS.TS.SpacePnt_Count.Total': 200
          },
          layer: {
            id: 'parking-lots',
            title: 'Parking Lots',
            popupComponent: TestPopupComponent,
            popupDataResolutionStrategy: 'cumulative',
            popupData: {
              name: {
                field: 'GIS.TS.ParkingLots.Name',
                collapsed: true
              },
              total: {
                field: 'GIS.TS.SpacePnt_Count.Total',
                collapsed: true
              },
              description: '{attributes.name}: {attributes.total}'
            }
          }
        }
      ]
    } as unknown as HitTestSnapshot;

    const result = service.getComponent(snapshot);

    expect(result?.component).toBe(TestPopupComponent);
    expect(result?.data.attributes.name).toBe('Lot 100');
    expect(result?.data.attributes.total).toBe(200);
    expect(result?.data.attributes.description).toBe('Lot 100: 200');
  });
});
