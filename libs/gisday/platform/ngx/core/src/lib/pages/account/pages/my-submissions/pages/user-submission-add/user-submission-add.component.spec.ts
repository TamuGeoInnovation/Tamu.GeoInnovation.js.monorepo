import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSubmissionAddComponent } from './user-submission-add.component';

describe('UserSubmissionAddComponent', () => {
  let component: UserSubmissionAddComponent;
  let fixture: ComponentFixture<UserSubmissionAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserSubmissionAddComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSubmissionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
