import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDetailSpeakerComponent } from './admin-detail-speaker.component';

describe('AdminDetailSpeakerComponent', () => {
  let component: AdminDetailSpeakerComponent;
  let fixture: ComponentFixture<AdminDetailSpeakerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDetailSpeakerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDetailSpeakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
