import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EsriMapService } from '../../services/map/map.service';
import { EsriModuleProviderService } from '../../services/module-provider/module-provider.service';
import { MapCompassComponent } from './map-compass.component';

// Calcite's icon is a browser custom element; jsdom only needs the tag.
vi.mock('@esri/calcite-components/components/calcite-icon', () => ({}));

/**
 * The compass that replaced Esri's Compass widget, keeping its needle on every basemap (#1853, #1845).
 */
describe('MapCompassComponent', () => {
  /** Stands in for a MapView: its rotation, its viewpoint, its UI corners and `goTo`. */
  function makeView() {
    const view = {
      rotation: 0,
      get viewpoint() {
        return { clone: () => ({ scale: 4000, rotation: view.rotation }) };
      },
      ui: { add: vi.fn(), remove: vi.fn() },
      goTo: vi.fn(() => Promise.resolve())
    };

    return view;
  }

  let view: ReturnType<typeof makeView>;
  let rotate: (rotation: number) => void;
  let watchHandle: { remove: Mock };

  /** `reactiveUtils.watch`, calling back at once as `initial: true` asks, and when `rotate` is called. */
  const reactiveUtils = {
    watch: vi.fn((getValue: () => number, callback: (value: number) => void) => {
      rotate = (rotation) => {
        view.rotation = rotation;
        callback(getValue());
      };

      callback(getValue());

      return watchHandle;
    })
  };

  async function create() {
    TestBed.configureTestingModule({
      imports: [MapCompassComponent],
      providers: [
        { provide: EsriMapService, useValue: { store: of({ map: {}, view }) } },
        { provide: EsriModuleProviderService, useValue: { require: () => Promise.resolve([reactiveUtils]) } }
      ]
    });

    const fixture = TestBed.createComponent(MapCompassComponent);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  const button = (host: HTMLElement) => host.querySelector('button') as HTMLButtonElement;
  const needle = (host: HTMLElement) => host.querySelector('calcite-icon') as HTMLElement;

  beforeEach(() => {
    view = makeView();
    watchHandle = { remove: vi.fn() };
  });

  it("moves itself into the top-left corner of the map view's UI", async () => {
    const fixture = await create();

    expect(view.ui.add).toHaveBeenCalledWith(fixture.nativeElement, 'top-left');
  });

  it('shows the needle, whatever the basemap', async () => {
    const fixture = await create();

    expect(needle(fixture.nativeElement).getAttribute('icon')).toBe('compass-needle');
  });

  it('turns the needle with the map', async () => {
    view.rotation = 30;

    const fixture = await create();

    expect(needle(fixture.nativeElement).style.transform).toBe('rotateZ(30deg)');

    rotate(275.5);
    fixture.detectChanges();

    expect(needle(fixture.nativeElement).style.transform).toBe('rotateZ(275.5deg)');
  });

  it('turns the map back to north when pressed', async () => {
    view.rotation = 30;

    const fixture = await create();

    button(fixture.nativeElement).click();

    expect(view.goTo).toHaveBeenCalledWith({ scale: 4000, rotation: 0 });
  });

  it('ignores a turn back to north that is interrupted', async () => {
    view.goTo.mockReturnValueOnce(Promise.reject(new Error('interrupted')));

    const fixture = await create();

    button(fixture.nativeElement).click();
    await fixture.whenStable();

    expect(view.goTo).toHaveBeenCalledTimes(1);
  });

  it('can be reached and pressed from the keyboard, and says what it does', async () => {
    const fixture = await create();
    const control = button(fixture.nativeElement);

    // A native button: in the tab order, and pressed by Enter and Space, with no handlers of our own.
    expect(control.tagName).toBe('BUTTON');
    expect(control.type).toBe('button');
    expect(control.hasAttribute('tabindex')).toBe(false);
    expect(control.disabled).toBe(false);
    expect(control.getAttribute('aria-label')).toBe('Reset compass orientation');

    control.focus();

    expect(document.activeElement).toBe(control);
    // The icon is decoration; the button's label is what is read out.
    expect(needle(fixture.nativeElement).getAttribute('aria-hidden')).toBe('true');
  });

  it('leaves the map and stops watching it when destroyed', async () => {
    const fixture = await create();
    const host = fixture.nativeElement;

    fixture.destroy();

    expect(watchHandle.remove).toHaveBeenCalled();
    expect(view.ui.remove).toHaveBeenCalledWith(host);
  });
});
