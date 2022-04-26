import { async, TestBed } from '@angular/core/testing';
import { QueryList } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { SidebarComponent } from './sidebar.component';
import { SidebarTabComponent } from '../tab/tab.component';

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
    const mouseEvent: MouseEvent = {} as unknown as MouseEvent;
    sidebarTab.route = 'test';

    expect(sidebarComponent).toBeTruthy();
    sidebarComponent.tabs = new QueryList<SidebarTabComponent>();
    sidebarComponent.tabs.reset([sidebarTab]);
    expect(sidebarComponent.ngAfterContentInit()).toBeUndefined();

    (sidebarTab as unknown as { clicked: (MouseEvent) => unknown }).clicked(mouseEvent);
    expect(sidebarComponent.currentView).toEqual(sidebarTab.route);
    expect(sidebarComponent.visible).toBeTruthy();

    (sidebarTab as unknown as { clicked: (MouseEvent) => unknown }).clicked(mouseEvent);
    expect(sidebarComponent.currentView).toEqual(sidebarTab.route);
    expect(sidebarComponent.visible).toBeFalsy();

    expect(sidebarComponent.ngOnDestroy()).toBeUndefined();
  });
});
