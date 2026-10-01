import { QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { SidebarComponent } from './sidebar.component';
import { SidebarTabComponent } from '../tab/tab.component';

/**
 * The first click on a tab moves the panel (#1249).
 *
 * `currentView` has to be in the tabs' own vocabulary - `''` for the default view, `'settings'`,
 * `'trip'` - because `_toggleVisibility` compares the clicked tab's route against it. It used to be
 * seeded from `router.url`, which gives the whole path (`'map/d'`), so it matched no tab: the first
 * click always took the "a different view was chosen" branch, set `visible = true` on an already
 * visible panel and merely recorded the view. Nothing moved until the second click.
 *
 * Constructed by hand so the tab list and the URL can be stated outright. Rendering the panel would
 * say nothing extra about which branch the click takes.
 */

const tab = (route: string) => {
  const clicked = new Subject<{ native: { route: string } }>();

  return {
    route,
    $clicked: clicked.asObservable(),
    click: () => clicked.next({ native: { route } })
  };
};

type FakeTab = ReturnType<typeof tab>;

const build = (url: string, tabs: FakeTab[]) => {
  const navigated: string[][] = [];
  const router = { url, navigate: (commands: string[]) => navigated.push(commands) };

  const component = new SidebarComponent(router as unknown as Router, {} as ActivatedRoute);

  const list = new QueryList<SidebarTabComponent>();
  list.reset(tabs as unknown as SidebarTabComponent[]);
  component.tabs = list;

  component.ngAfterContentInit();

  return { component, navigated };
};

describe('SidebarComponent first click', () => {
  it('starts on the default view when the URL names no tab', () => {
    const { component } = build('/map/d', [tab(''), tab('trip'), tab('settings')]);

    // Not 'map/d', which is what the whole path used to give.
    expect(component.currentView).toBe('');
  });

  it('closes the panel on the first click of the tab already showing', () => {
    const features = tab('');
    const { component } = build('/map/d', [features, tab('trip'), tab('settings')]);

    expect(component.visible).toBe(true);

    features.click();

    expect(component.visible).toBe(false);
  });

  it('reopens it on the second click, rather than needing a third', () => {
    const features = tab('');
    const { component } = build('/map/d', [features, tab('settings')]);

    features.click();
    features.click();

    expect(component.visible).toBe(true);
  });

  it('starts on the tab the URL names, for a deep link', () => {
    const { component } = build('/map/d/settings', [tab(''), tab('settings')]);

    expect(component.currentView).toBe('settings');
  });

  it('ignores a query string when resolving the current tab', () => {
    const { component } = build('/map/d/settings?basemap=aggie_basemap', [tab(''), tab('settings')]);

    expect(component.currentView).toBe('settings');
  });

  it('switches to a different tab without closing the panel', () => {
    const settings = tab('settings');
    const { component, navigated } = build('/map/d', [tab(''), settings]);

    settings.click();

    expect(component.visible).toBe(true);
    expect(component.currentView).toBe('settings');
    expect(navigated).toEqual([['./settings']]);
  });

  it('does not treat a path segment that is not a tab as the current view', () => {
    // `/map/d` ends in 'd', which is not a tab route. Matching on it would make the default tab's
    // first click take the wrong branch again.
    const { component } = build('/map/d', [tab(''), tab('trip')]);

    expect(component.currentView).toBe('');
  });
});
