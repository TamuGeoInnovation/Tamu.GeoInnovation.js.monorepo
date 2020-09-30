import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditSpeakersComponent } from './admin-edit-speakers.component';

describe('AdminEditSpeakersComponent', () => {
  let component: AdminEditSpeakersComponent;
  let fixture: ComponentFixture<AdminEditSpeakersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminEditSpeakersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditSpeakersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
