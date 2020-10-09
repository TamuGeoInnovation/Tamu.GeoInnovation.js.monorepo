import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSubmissionComponent } from './view-submission.component';

describe('ViewSubmissionComponent', () => {
  let component: ViewSubmissionComponent;
  let fixture: ComponentFixture<ViewSubmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSubmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
