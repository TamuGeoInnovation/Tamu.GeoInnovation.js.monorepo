import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddSpeakersComponent } from './admin-add-speakers.component';

describe('AdminAddSpeakersComponent', () => {
  let component: AdminAddSpeakersComponent;
  let fixture: ComponentFixture<AdminAddSpeakersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAddSpeakersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddSpeakersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
