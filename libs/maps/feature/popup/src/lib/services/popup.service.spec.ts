import { TestBed } from '@angular/core/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { HitTestSnapshot } from '@tamu-gisc/maps/esri';

import { PopupService } from './popup.service';

describe('PopupService', () => {
  let service: PopupService;

  class TestPopupComponent {}
  class BuildingPopupComponent {}
  class SpacePopupComponent {}

  // A feature opened by a link or a search is drawn on the selection layer, whose title and popup are the
  // main map's buildings (#1970). Its parent is the map.
  const selectionLayer = {
    id: 'selection-layer',
    title: 'Selected Buildings',
    popupComponent: BuildingPopupComponent,
    parent: { findLayerById: (id: string) => mapLayers.find((layer) => layer.id === id) }
  };
  const spacesLayer = {
    id: 'motorcycle-parking-space',
    title: 'Motorcycle Parking Space',
    popupComponent: SpacePopupComponent,
    popupData: { lotName: { field: 'LotName', collapsed: true } }
  };
  const mapLayers = [selectionLayer, spacesLayer];

  /** A motorcycle space selected by `?lot=100j`, as the event service stamps it and the map service draws it. */
  const selectedSpace = () => ({
    attributes: { OBJECTID: 32270, LotName: '100j', __featureLayerId: spacesLayer.id, __featureObjectId: 32270 },
    layer: selectionLayer
  });

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

  it('should format date fields when the entry declares format: date', () => {
    // ArcGIS returns esriFieldTypeDate attributes as epoch milliseconds. Without formatting,
    // a popup template substitutes the raw number (e.g. 1754784000000) into its output.
    const snapshot = {
      graphics: [
        {
          attributes: {
            name: 'Aplin Center',
            startdate: 1754784000000
          },
          layer: {
            id: 'construction',
            title: 'Construction',
            popupComponent: TestPopupComponent,
            popupDataResolutionStrategy: 'cumulative',
            popupData: {
              projectName: { field: 'name', collapsed: true },
              startDate: { field: 'startdate', collapsed: true, format: 'date' },
              description: 'Start Date: {attributes.startDate}'
            }
          }
        }
      ]
    } as unknown as HitTestSnapshot;

    const result = service.getComponent(snapshot);

    expect(result?.data.attributes.startDate).toBe('August 10, 2025');
    expect(result?.data.attributes.description).toBe('Start Date: August 10, 2025');
  });

  describe('a feature on the selection layer (#1970)', () => {
    it('is shown as its own layer shows it when the selection names the popup', () => {
      const snapshot = { graphics: [selectedSpace()], popupComponent: SpacePopupComponent } as unknown as HitTestSnapshot;

      const result = service.getComponent(snapshot);

      expect(result?.component).toBe(SpacePopupComponent);
      expect(result?.data?.layer?.title).toBe('Motorcycle Parking Space');
      expect(result?.data?.attributes.OBJECTID).toBe(32270);
    });

    it("opens its own layer's popup, with that layer's data, when the highlight is clicked", () => {
      const snapshot = { graphics: [selectedSpace()] } as unknown as HitTestSnapshot;

      const result = service.getComponent(snapshot);

      expect(result?.component).toBe(SpacePopupComponent);
      expect(result?.data?.layer?.title).toBe('Motorcycle Parking Space');
      expect(result?.data?.attributes.lotName).toBe('100j');
    });

    it('leaves the drawn highlight on the selection layer', () => {
      const graphic = selectedSpace();

      service.getComponent({ graphics: [graphic] } as unknown as HitTestSnapshot);

      expect(graphic.layer).toBe(selectionLayer);
    });

    it('is still a building when it names no layer of its own, as a building search result does', () => {
      const building = { attributes: { Number: '1510', BldgName: 'Wehner' }, layer: selectionLayer };

      const clicked = service.getComponent({ graphics: [building] } as unknown as HitTestSnapshot);
      const searched = service.getComponent({
        graphics: [building],
        popupComponent: BuildingPopupComponent
      } as unknown as HitTestSnapshot);

      expect(clicked?.component).toBe(BuildingPopupComponent);
      expect(clicked?.data).toBe(building);
      expect(searched?.component).toBe(BuildingPopupComponent);
      expect(searched?.data).toBeUndefined();
    });
  });
});
