import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSubmissionListComponent } from './user-submission-list.component';

describe('UserSubmissionListComponent', () => {
  let component: UserSubmissionListComponent;
  let fixture: ComponentFixture<UserSubmissionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSubmissionListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSubmissionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
