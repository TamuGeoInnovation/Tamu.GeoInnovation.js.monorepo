import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditSubmissionTypesComponent } from './admin-edit-submission-types.component';

describe('AdminEditSubmissionTypesComponent', () => {
  let component: AdminEditSubmissionTypesComponent;
  let fixture: ComponentFixture<AdminEditSubmissionTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminEditSubmissionTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditSubmissionTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
