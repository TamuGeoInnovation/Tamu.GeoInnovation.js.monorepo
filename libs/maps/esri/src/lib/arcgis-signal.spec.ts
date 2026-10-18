import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { arcgisSignal } from './arcgis-signal';
import { EsriModuleProviderService } from './services/module-provider/module-provider.service';

interface FakeLayer {
  visible: boolean;
}

/** Reads a layer's `visible` the way an OnPush template should: through `arcgisSignal`. */
@Component({
  selector: 'tamu-gisc-arcgis-signal-host',
  template: '{{ visible() }}'
})
class HostComponent {
  public readonly layer = input<FakeLayer>(undefined);

  public readonly visible = arcgisSignal(() => this.layer()?.visible);
}

describe('arcgisSignal', () => {
  /** The watches the fake reactiveUtils holds. `changed` runs each one, as ArcGIS would after a change. */
  let watches: Array<{ check: () => void }>;
  let fixture: ComponentFixture<HostComponent>;

  const changed = () => watches.forEach((watch) => watch.check());

  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return (fixture.nativeElement as HTMLElement).textContent.trim();
  };

  beforeEach(() => {
    watches = [];

    const reactiveUtils = {
      watch: (getter: () => unknown, callback: () => void, options?: { initial?: boolean }) => {
        let last = getter();
        const watch = {
          check: () => {
            const next = getter();

            if (next !== last) {
              last = next;
              callback();
            }
          }
        };

        watches.push(watch);

        if (options?.initial) {
          callback();
        }

        return { remove: () => (watches = watches.filter((w) => w !== watch)) };
      }
    };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: EsriModuleProviderService, useValue: { require: () => Promise.resolve([reactiveUtils]) } }]
    });

    fixture = TestBed.createComponent(HostComponent);
  });

  it('follows a change ArcGIS makes in place, which an OnPush template would otherwise miss', async () => {
    const layer = { visible: true };
    fixture.componentRef.setInput('layer', layer);

    expect(await render()).toBe('true');

    layer.visible = false;
    expect(await render()).toBe('true');

    changed();
    expect(await render()).toBe('false');
  });

  it('moves the watch onto the object a new input brings', async () => {
    const first = { visible: true };
    const second = { visible: false };

    fixture.componentRef.setInput('layer', first);
    await render();

    fixture.componentRef.setInput('layer', second);
    expect(await render()).toBe('false');
    expect(watches).toHaveLength(1);

    second.visible = true;
    changed();
    expect(await render()).toBe('true');
  });

  it('ends the watch with the component', async () => {
    fixture.componentRef.setInput('layer', { visible: true });
    await render();

    expect(watches).toHaveLength(1);

    fixture.destroy();

    expect(watches).toHaveLength(0);
  });
});
