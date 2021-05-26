import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDetailEventComponent } from './admin-detail-event.component';

describe('AdminDetailEventComponent', () => {
  let component: AdminDetailEventComponent;
  let fixture: ComponentFixture<AdminDetailEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDetailEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDetailEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
