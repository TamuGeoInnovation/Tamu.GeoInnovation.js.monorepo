import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignageComponent } from './signage.component';

describe('SignageComponent', () => {
  let component: SignageComponent;
  let fixture: ComponentFixture<SignageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
