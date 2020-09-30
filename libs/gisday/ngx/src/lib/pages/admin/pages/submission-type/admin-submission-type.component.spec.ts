import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSubmissionTypeComponent } from './admin-submission-type.component';

describe('AdminSubmissionTypeComponent', () => {
  let component: AdminSubmissionTypeComponent;
  let fixture: ComponentFixture<AdminSubmissionTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminSubmissionTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSubmissionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
