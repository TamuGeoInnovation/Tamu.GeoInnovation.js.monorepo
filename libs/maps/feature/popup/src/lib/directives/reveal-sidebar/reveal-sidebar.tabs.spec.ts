import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { SidebarComponent, SidebarTabComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { EsriMapService, HitTestSnapshot } from '@tamu-gisc/maps/esri';

import { RevealSidebarOnPopupDirective } from './reveal-sidebar.directive';
import { PopupComponent } from '../../containers/base/base.component';
import { PopupService } from '../../services/popup.service';

/**
 * Choosing a sidebar tab while a feature's details are open (#1806).
 *
 * The details render on top of the panel's routed view, so before this the tabs changed the route
 * underneath them and nothing visible happened: the URL said `/settings`, the details stayed, and only
 * their [X] got the panel back.
 *
 * Rendered, with the real sidebar, tabs and popup panel, because what matters is the order things
 * happen in on one click: the sidebar handles the tab first, then the details have to go.
 */

@Component({
  imports: [SidebarComponent, SidebarTabComponent, RevealSidebarOnPopupDirective, PopupComponent],
  template: `
    <tamu-gisc-sidebar [position]="'right'" tamuGiscRevealSidebarOnPopup>
      <div class="tabs left">
        <tamu-gisc-sidebar-tab id="features" [route]="''"></tamu-gisc-sidebar-tab>
        <tamu-gisc-sidebar-tab id="settings" [route]="'settings'"></tamu-gisc-sidebar-tab>
      </div>
      <div class="content">
        <tamu-gisc-feature-popup></tamu-gisc-feature-popup>
      </div>
    </tamu-gisc-sidebar>
  `
})
class HostComponent {
  public readonly sidebar = viewChild.required(SidebarComponent);
}

describe('RevealSidebarOnPopupDirective with sidebar tabs', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hitTest: BehaviorSubject<HitTestSnapshot>;
  let map: { hitTest: BehaviorSubject<HitTestSnapshot>; clearHitTest: jest.Mock; clearSelectedFeatures: jest.Mock };
  let navigate: jest.Mock;

  const element = () => fixture.nativeElement as HTMLElement;
  const detailsShowing = () => !element().querySelector('.popup')?.classList.contains('hidden');

  const clickTab = (id: string) => {
    (element().querySelector(`#${id}`) as HTMLElement).click();
    fixture.detectChanges();
  };

  /** What a feature click does first: ask for the details panel. */
  const openDetails = () => {
    TestBed.inject(PopupService).showPopup();
    fixture.detectChanges();
  };

  beforeEach(() => {
    hitTest = new BehaviorSubject<HitTestSnapshot>({ graphics: [] });
    map = {
      hitTest,
      // As the real service does: clearing the hit test publishes an empty one, which hides the details.
      clearHitTest: jest.fn(() => hitTest.next({ graphics: [] })),
      clearSelectedFeatures: jest.fn()
    };
    navigate = jest.fn(() => Promise.resolve(true));

    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideNoopAnimations(),
        { provide: EnvironmentService, useValue: { value: () => undefined } },
        { provide: EsriMapService, useValue: map },
        { provide: Router, useValue: { url: '/events/tailgating/map/d', navigate } },
        { provide: ActivatedRoute, useValue: {} }
      ]
    });

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('starts with no details showing', () => {
    expect(detailsShowing()).toBe(false);
  });

  it('closes the details when another tab is chosen, so its panel shows', () => {
    openDetails();
    expect(detailsShowing()).toBe(true);

    clickTab('settings');

    expect(navigate).toHaveBeenCalledWith(['./settings'], expect.anything());
    expect(detailsShowing()).toBe(false);
    expect(fixture.componentInstance.sidebar().visible()).toBe(true);
  });

  it('closes them as their [X] does, clearing the selection too', () => {
    openDetails();

    clickTab('settings');

    expect(map.clearHitTest).toHaveBeenCalledTimes(1);
    expect(map.clearSelectedFeatures).toHaveBeenCalledTimes(1);
  });

  it('shows the tab already chosen underneath, rather than collapsing the panel', () => {
    // Details opened from the default view: its tab is the one "already showing", which on its own
    // would collapse the panel. The user asked to see that view, so it stays open with the details gone.
    openDetails();

    clickTab('features');

    expect(detailsShowing()).toBe(false);
    expect(fixture.componentInstance.sidebar().visible()).toBe(true);
  });

  it('still collapses the panel from its own tab when no details are open', () => {
    clickTab('features');

    expect(fixture.componentInstance.sidebar().visible()).toBe(false);
    expect(map.clearHitTest).not.toHaveBeenCalled();
  });

  it('leaves the selection alone when switching tabs with no details open', () => {
    clickTab('settings');

    expect(map.clearHitTest).not.toHaveBeenCalled();
    expect(map.clearSelectedFeatures).not.toHaveBeenCalled();
    expect(fixture.componentInstance.sidebar().visible()).toBe(true);
  });

  it('does not close the details for a click elsewhere in the panel', () => {
    openDetails();

    (element().querySelector('.popup') as HTMLElement).click();
    fixture.detectChanges();

    expect(detailsShowing()).toBe(true);
    expect(map.clearHitTest).not.toHaveBeenCalled();
  });
});
