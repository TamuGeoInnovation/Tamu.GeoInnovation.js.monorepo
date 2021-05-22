import { async, inject, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SidebarTabComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { QueryList } from '@angular/core';

describe('SidebarComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarComponent],
      imports: [RouterTestingModule.withRoutes([{ path: 'test', component: SidebarComponent }])]
    }).compileComponents();
  }));

  it('should create', () => {
    const sidebarComponent = TestBed.createComponent(SidebarComponent).componentInstance;

    const sidebarTab = new SidebarTabComponent();
    const mouseEvent: MouseEvent = ({} as unknown) as MouseEvent;
    sidebarTab.route = 'test';

    expect(sidebarComponent).toBeTruthy();
    sidebarComponent.tabs = new QueryList<SidebarTabComponent>();
    sidebarComponent.tabs.reset([sidebarTab]);
    expect(sidebarComponent.ngAfterContentInit()).toBeUndefined();

    console.warn = () => {}; // Hide ngZone warning

    ((sidebarTab as unknown) as { clicked: (MouseEvent) => unknown }).clicked(mouseEvent);
    expect(sidebarComponent.currentView).toEqual(sidebarTab.route);
    expect(sidebarComponent.visible).toBeTruthy();

    ((sidebarTab as unknown) as { clicked: (MouseEvent) => unknown }).clicked(mouseEvent);
    expect(sidebarComponent.currentView).toEqual(sidebarTab.route);
    expect(sidebarComponent.visible).toBeFalsy();

    expect(sidebarComponent.ngOnDestroy()).toBeUndefined();
  });
});
