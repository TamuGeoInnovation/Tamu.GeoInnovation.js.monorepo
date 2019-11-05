import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileTabNavigationTab } from './tab.component';

describe('MobileTabNavigationTab', () => {
  let component: MobileTabNavigationTab;
  let fixture: ComponentFixture<MobileTabNavigationTab>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileTabNavigationTab]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileTabNavigationTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
