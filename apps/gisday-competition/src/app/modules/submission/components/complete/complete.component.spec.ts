import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionCompleteComponent } from './complete.component';

describe('SubmissionCompleteComponent', () => {
  let component: SubmissionCompleteComponent;
  let fixture: ComponentFixture<SubmissionCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SubmissionCompleteComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
