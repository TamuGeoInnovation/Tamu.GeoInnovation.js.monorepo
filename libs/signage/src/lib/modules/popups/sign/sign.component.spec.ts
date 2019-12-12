import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignPopupComponent } from './sign.component';

describe('SignPopupComponent', () => {
  let component: SignPopupComponent;
  let fixture: ComponentFixture<SignPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
