import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpeakerComponent } from './admin-speaker.component';

describe('AdminSpeakerComponent', () => {
  let component: AdminSpeakerComponent;
  let fixture: ComponentFixture<AdminSpeakerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminSpeakerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSpeakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
