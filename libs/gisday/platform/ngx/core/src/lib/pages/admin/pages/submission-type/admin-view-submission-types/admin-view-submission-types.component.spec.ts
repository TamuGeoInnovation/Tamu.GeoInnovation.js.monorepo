import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewSubmissionTypesComponent } from './admin-view-submission-types.component';

describe('AdminViewSubmissionTypesComponent', () => {
  let component: AdminViewSubmissionTypesComponent;
  let fixture: ComponentFixture<AdminViewSubmissionTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminViewSubmissionTypesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewSubmissionTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
