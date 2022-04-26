import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MobileTabNavigationTabComponent } from './tab.component';

describe('MobileTabNavigationTabComponent', () => {
  let component: MobileTabNavigationTabComponent;
  let fixture: ComponentFixture<MobileTabNavigationTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [MobileTabNavigationTabComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileTabNavigationTabComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    const spy = spyOn(component, 'navigate');

    component.navigate();
    expect(spy).toHaveBeenCalled();
  });
});
