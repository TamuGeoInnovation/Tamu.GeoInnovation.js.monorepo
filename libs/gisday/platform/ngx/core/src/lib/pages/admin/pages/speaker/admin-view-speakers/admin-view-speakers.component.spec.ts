import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewSpeakersComponent } from './admin-view-speakers.component';

describe('AdminViewSpeakersComponent', () => {
  let component: AdminViewSpeakersComponent;
  let fixture: ComponentFixture<AdminViewSpeakersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminViewSpeakersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewSpeakersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
