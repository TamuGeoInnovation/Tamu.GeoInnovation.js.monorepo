import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileTabNavigation } from './container.component';

describe('MobileTabNavigation', () => {
  let component: MobileTabNavigation;
  let fixture: ComponentFixture<MobileTabNavigation>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileTabNavigation ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileTabNavigation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
