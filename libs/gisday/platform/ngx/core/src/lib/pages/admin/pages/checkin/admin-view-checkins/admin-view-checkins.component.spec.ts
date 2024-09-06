import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewCheckinsComponent } from './admin-view-checkins.component';

describe('AdminViewCheckinsComponent', () => {
  let component: AdminViewCheckinsComponent;
  let fixture: ComponentFixture<AdminViewCheckinsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminViewCheckinsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewCheckinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
