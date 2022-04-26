import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileTabNavigationComponent } from './container.component';

describe('MobileTabNavigationComponent', () => {
  let component: MobileTabNavigationComponent;
  let fixture: ComponentFixture<MobileTabNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileTabNavigationComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileTabNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
