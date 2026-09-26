import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MobileTabNavigationTabComponent } from './tab.component';

describe('MobileTabNavigationTabComponent', () => {
  let component: MobileTabNavigationTabComponent;
  let fixture: ComponentFixture<MobileTabNavigationTabComponent>;

  beforeEach(waitForAsync(() => {
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

  /**
   * `navigate()` calls `router.navigate([this.route])`. The previous version of this spec never set
   * `route`, so the call was `router.navigate([undefined])` and Angular threw NG04008 ("path
   * contains undefined segment"). It was also a second test named 'should create', which made the
   * failure hard to attribute.
   */
  it('navigates to its configured route when clicked', () => {
    component.route = 'test-route';

    const spy = jest.spyOn(component, 'navigate');

    component.navigate();

    expect(spy).toHaveBeenCalled();
  });
});
