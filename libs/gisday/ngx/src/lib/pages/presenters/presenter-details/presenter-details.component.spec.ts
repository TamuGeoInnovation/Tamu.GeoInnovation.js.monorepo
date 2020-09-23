import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresenterDetailsComponent } from './presenter-details.component';

describe('PresenterDetailsComponent', () => {
  let component: PresenterDetailsComponent;
  let fixture: ComponentFixture<PresenterDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresenterDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresenterDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
