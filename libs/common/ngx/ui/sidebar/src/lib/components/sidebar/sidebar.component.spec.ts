import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { SidebarComponent } from './sidebar.component';
import { SidebarTabComponent } from '../tab/tab.component';

describe('SidebarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: 'test', component: SidebarComponent }]), SidebarComponent],
      // Zoneless, Angular renders a created component by itself, so its @slide trigger needs an
      // animations provider (#1478).
      providers: [provideNoopAnimations()]
    }).compileComponents();
  });

  it('should create', () => {
    const sidebarComponent = TestBed.createComponent(SidebarComponent).componentInstance;

    const tabFixture = TestBed.createComponent(SidebarTabComponent);
    const sidebarTab = tabFixture.componentInstance;
    const mouseEvent: MouseEvent = {} as unknown as MouseEvent;
    tabFixture.componentRef.setInput('route', 'test');

    expect(sidebarComponent).toBeTruthy();
    // The tab a template would project, in place of the content query.
    Object.defineProperty(sidebarComponent, 'tabs', { value: () => [sidebarTab] });
    expect(sidebarComponent.ngAfterContentInit()).toBeUndefined();

    (sidebarTab as unknown as { clicked: (MouseEvent) => unknown }).clicked(mouseEvent);
    expect(sidebarComponent.currentView).toEqual(sidebarTab.route());
    expect(sidebarComponent.visible()).toBeTruthy();

    (sidebarTab as unknown as { clicked: (MouseEvent) => unknown }).clicked(mouseEvent);
    expect(sidebarComponent.currentView).toEqual(sidebarTab.route());
    expect(sidebarComponent.visible()).toBeFalsy();

    expect(sidebarComponent.ngOnDestroy()).toBeUndefined();
  });
});
