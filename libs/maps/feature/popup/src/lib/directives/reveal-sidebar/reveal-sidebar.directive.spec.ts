import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { SidebarComponent } from '@tamu-gisc/common/ngx/ui/sidebar';

import { RevealSidebarOnPopupDirective } from './reveal-sidebar.directive';
import { PopupService } from '../../services/popup.service';

/**
 * Revealing the sidebar when a feature popup opens (#1244).
 *
 * Before this directive there was no mechanism at all: the popup renders inside the panel, so with the
 * panel closed, clicking a feature produced nothing on screen.
 *
 * Constructed by hand, with fakes. The real ones would need the Esri map service and a rendered sidebar to say
 * anything about one boolean.
 */

class FakeSidebar {
  public visible: string | boolean = true;
}

describe('RevealSidebarOnPopupDirective', () => {
  let opened: Subject<void>;
  let sidebar: FakeSidebar;
  let directive: RevealSidebarOnPopupDirective;

  const build = (visible: boolean) => {
    opened = new Subject<void>();
    sidebar = new FakeSidebar();
    sidebar.visible = visible;

    directive = TestBed.resetTestingModule()
      .configureTestingModule({
        providers: [
          { provide: SidebarComponent, useValue: sidebar },
          { provide: PopupService, useValue: { opened: opened.asObservable() } }
        ]
      })
      .runInInjectionContext(() => new RevealSidebarOnPopupDirective());
    directive.ngOnInit();

    return directive;
  };

  afterEach(() => {
    directive?.ngOnDestroy();
  });

  it('opens a closed sidebar when a popup opens', () => {
    build(false);

    opened.next();

    expect(sidebar.visible).toBe(true);
  });

  it('leaves an already open sidebar alone', () => {
    build(true);

    opened.next();

    expect(sidebar.visible).toBe(true);
  });

  it('does not touch the sidebar before any popup opens', () => {
    build(false);

    expect(sidebar.visible).toBe(false);
  });

  it('never closes the sidebar', () => {
    build(false);

    opened.next();
    opened.next();
    opened.next();

    expect(sidebar.visible).toBe(true);
  });

  it('stops reacting once destroyed', () => {
    build(false);
    directive.ngOnDestroy();

    opened.next();

    expect(sidebar.visible).toBe(false);
  });
});
