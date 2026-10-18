import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService, HitTestSnapshot, lazyPopup, PopupComponentReference } from '@tamu-gisc/maps/esri';

import { PopupComponent } from './base.component';
import { PopupService } from '../../services/popup.service';

/**
 * A definition may name its popup as a component or as something that loads one (#1454). The container
 * has to render either, and must not let a popup that finished loading late replace a newer one.
 */

@Component({ selector: 'tamu-gisc-test-first-popup', template: 'first popup' })
class FirstPopupComponent {
  public data: unknown;
}

@Component({ selector: 'tamu-gisc-test-second-popup', template: 'second popup' })
class SecondPopupComponent {
  public data: unknown;
}

/** Shows the feature it is given, as every real popup does. OnPush, as they now are (#1673). */
@Component({ selector: 'tamu-gisc-test-data-popup', template: 'feature {{ data?.attributes?.name }}' })
class DataPopupComponent {
  public data: { attributes: { name: string } };
}

/** A lazy popup whose download finishes only when the test says so. */
function deferred(component: Type<unknown>) {
  let finish: () => void = () => undefined;
  const loaded = new Promise<Type<unknown>>((resolve) => (finish = () => resolve(component)));

  return { reference: lazyPopup(() => loaded), finish };
}

describe('PopupComponent with lazily loaded popups', () => {
  let hitTest: Subject<HitTestSnapshot>;
  let fixture: ComponentFixture<PopupComponent>;

  const open = (popupComponent: PopupComponentReference) =>
    hitTest.next({ graphics: [{ attributes: {} }] as unknown as HitTestSnapshot['graphics'], popupComponent });

  const settle = async () => {
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
  };

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  beforeEach(() => {
    hitTest = new Subject<HitTestSnapshot>();

    TestBed.configureTestingModule({
      imports: [PopupComponent],
      providers: [
        { provide: EnvironmentService, useValue: { value: () => undefined } },
        { provide: EsriMapService, useValue: { hitTest, clearHitTest: jest.fn(), clearSelectedFeatures: jest.fn() } }
      ]
    });

    fixture = TestBed.createComponent(PopupComponent);
    fixture.detectChanges();
  });

  it('renders a popup named by its component, as before', async () => {
    open(FirstPopupComponent);
    await settle();

    expect(text()).toContain('first popup');
  });

  it('draws the feature it hands an OnPush popup, and the next feature in its place (#1673)', async () => {
    const select = (name: string) =>
      hitTest.next({
        graphics: [{ attributes: { name } }] as unknown as HitTestSnapshot['graphics'],
        popupComponent: DataPopupComponent
      });

    select('Academic Building');
    await settle();
    expect(text()).toContain('feature Academic Building');

    select('Evans Library');
    await settle();
    expect(text()).toContain('feature Evans Library');
    expect(text()).not.toContain('Academic Building');
  });

  it('renders a lazily loaded popup once it has loaded, and not before', async () => {
    const first = deferred(FirstPopupComponent);

    open(first.reference);
    await settle();
    expect(text()).not.toContain('first popup');

    first.finish();
    await settle();
    expect(text()).toContain('first popup');
  });

  it('keeps the newer popup when an older one finishes loading late', async () => {
    const slow = deferred(FirstPopupComponent);

    open(slow.reference);
    open(SecondPopupComponent);
    await settle();
    expect(text()).toContain('second popup');

    slow.finish();
    await settle();
    expect(text()).toContain('second popup');
    expect(text()).not.toContain('first popup');
  });

  it('shows nothing when the popup is closed before its component loads', async () => {
    const slow = deferred(FirstPopupComponent);

    open(slow.reference);
    hitTest.next({ graphics: [] });
    slow.finish();
    await settle();

    expect(text()).not.toContain('first popup');
  });

  /**
   * The sidebar shows its own default panel whenever nothing is asking for the popup panel. Asking
   * for it only after the component had downloaded left a gap: between one feature's popup closing
   * and the next one's component arriving, the sidebar fell back to its default view for about
   * 100 ms - the Share Map and Layers panel on an event map (#1684).
   *
   * A dynamic import never resolves in the same tick, so the gap was there even with the chunk
   * cached, which is why it showed on every feature-to-feature selection rather than only the first.
   */
  it('asks for the popup panel before the component has loaded, so the sidebar does not fall back', async () => {
    const popup = TestBed.inject(PopupService);
    const shown: Array<boolean> = [];

    popup.show.subscribe((value) => shown.push(value));
    popup.hidePopup();

    const slow = deferred(FirstPopupComponent);

    open(slow.reference);
    await settle();

    expect(text()).not.toContain('first popup');
    expect(shown[shown.length - 1]).toBe(true);

    slow.finish();
    await settle();
    expect(text()).toContain('first popup');
  });

  it('leaves the panel hidden when the popup is closed while its component is still loading', async () => {
    const popup = TestBed.inject(PopupService);
    const shown: Array<boolean> = [];

    popup.show.subscribe((value) => shown.push(value));

    const slow = deferred(FirstPopupComponent);

    open(slow.reference);
    hitTest.next({ graphics: [] });
    slow.finish();
    await settle();

    expect(shown[shown.length - 1]).toBe(false);
    expect(text()).not.toContain('first popup');
  });
});
