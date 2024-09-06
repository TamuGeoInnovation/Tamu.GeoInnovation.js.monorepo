import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddSubmissionTypesComponent } from './admin-add-submission-types.component';

describe('AdminAddSubmissionTypesComponent', () => {
  let component: AdminAddSubmissionTypesComponent;
  let fixture: ComponentFixture<AdminAddSubmissionTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminAddSubmissionTypesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddSubmissionTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
