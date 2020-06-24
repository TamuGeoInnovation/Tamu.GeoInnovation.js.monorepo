import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { MobileTabNavigationTab } from './tab.component';

describe('MobileTabNavigationTab', () => {
  let component: MobileTabNavigationTab;
  let fixture: ComponentFixture<MobileTabNavigationTab>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [MobileTabNavigationTab]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileTabNavigationTab);
    router = TestBed.get(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    const spy = spyOn(component, 'navigate');
    const e: MouseEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    component.navigate(e);
    expect(spy).toHaveBeenCalled();
  });
});
