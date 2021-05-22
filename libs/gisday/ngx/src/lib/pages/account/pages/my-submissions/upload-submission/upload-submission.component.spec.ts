import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadSubmissionComponent } from './upload-submission.component';

describe('UploadSubmissionComponent', () => {
  let component: UploadSubmissionComponent;
  let fixture: ComponentFixture<UploadSubmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadSubmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
