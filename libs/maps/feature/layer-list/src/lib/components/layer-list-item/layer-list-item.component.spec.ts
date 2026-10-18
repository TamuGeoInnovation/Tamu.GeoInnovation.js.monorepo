import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { LayerListItemComponent } from './layer-list-item.component';

describe('LayerListItemComponent', () => {
  let fixture: ComponentFixture<LayerListItemComponent>;

  /** The watches the fake reactiveUtils holds. `changed` runs them, as ArcGIS does after a change. */
  let watches: Array<() => void>;

  const changed = () => watches.forEach((watch) => watch());

  const row = () => (fixture.nativeElement as HTMLElement).querySelector('.layer-item');

  beforeEach(async () => {
    watches = [];

    const reactiveUtils = {
      watch: (getter: () => unknown, callback: () => void) => {
        const watch = () => {
          getter();
          callback();
        };

        watches.push(watch);

        return { remove: () => (watches = watches.filter((w) => w !== watch)) };
      }
    };

    await TestBed.configureTestingModule({
      imports: [LayerListItemComponent],
      providers: [{ provide: EsriModuleProviderService, useValue: { require: () => Promise.resolve([reactiveUtils]) } }]
    }).compileComponents();

    fixture = TestBed.createComponent(LayerListItemComponent);
  });

  const show = async (item: object) => {
    fixture.componentRef.setInput('listItem', item as __esri.ListItem);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('follows a layer turned on elsewhere, such as from the legend (#1673)', async () => {
    const item = { title: 'Buildings', visible: false, updating: false, layer: { visible: false }, children: null };

    await show(item);

    expect(row().classList).not.toContain('visible');

    item.visible = true;
    changed();
    fixture.detectChanges();

    expect(row().classList).toContain('visible');
  });

  it('turns its layer on and off', async () => {
    const layer = { visible: false };
    const item = { title: 'Buildings', visible: false, updating: false, layer, children: null };

    await show(item);

    (row().querySelector('p') as HTMLElement).click();

    expect(layer.visible).toBe(true);
  });

  it('stops showing the spinner once the layer has drawn (#1673)', async () => {
    const item = { title: 'Buildings', visible: true, updating: true, layer: { visible: true }, children: null };

    await show(item);

    expect(row().querySelector('.spinning-loader')).not.toBeNull();

    item.updating = false;
    changed();
    fixture.detectChanges();

    expect(row().querySelector('.spinning-loader')).toBeNull();
    expect(row().querySelector('.layer-visibility-dot')).not.toBeNull();
  });
});
