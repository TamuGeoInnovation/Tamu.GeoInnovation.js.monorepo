import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditCheckinsComponent } from './admin-edit-checkins.component';

describe('AdminEditCheckinsComponent', () => {
  let component: AdminEditCheckinsComponent;
  let fixture: ComponentFixture<AdminEditCheckinsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminEditCheckinsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditCheckinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
