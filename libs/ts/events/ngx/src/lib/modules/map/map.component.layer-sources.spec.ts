import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerSourcesService } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { EventSettingsService } from '../../services/settings/event-settings.service';
import { EventService } from '../../services/event/event.service';
import { MapComponent } from './map.component';

/**
 * An event map keeps its layer overrides to itself (#1397).
 *
 * `EventService` writes the map's `defaultLayerOverrides` into `LayerSourcesService`, and the main map
 * reads that service when it loads. With only the application's shared instance, an event map's
 * overrides stayed after it closed, and going back to the main map without a reload drew it with them:
 * after the dining kiosk, the main map's Dining Locations came up switched on.
 *
 * The smoke check `isolation.spec.ts` sees that only while some map overrides a layer's visibility.
 * This one fails whenever the map stops providing its own instance, whatever the definitions say.
 */
describe('MapComponent layer sources', () => {
  it("uses its own LayerSourcesService, not the application's", () => {
    TestBed.configureTestingModule({
      declarations: [MapComponent],
      providers: [
        { provide: EnvironmentService, useValue: { value: () => [] } },
        { provide: ResponsiveService, useValue: {} },
        { provide: NotificationService, useValue: {} },
        { provide: TestingService, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: LocalStoreService, useValue: {} },
        { provide: EventSettingsService, useValue: {} },
        { provide: ModalService, useValue: {} }
      ]
    })
      // The map itself is not under test; only which injector its providers live in.
      .overrideTemplate(MapComponent, '')
      .overrideProvider(EventService, { useValue: {} });

    const fixture = TestBed.createComponent(MapComponent);

    expect(fixture.debugElement.injector.get(LayerSourcesService)).not.toBe(TestBed.inject(LayerSourcesService));
  });
});
