import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminClassComponent } from './admin-class.component';

describe('AdminClassComponent', () => {
  let component: AdminClassComponent;
  let fixture: ComponentFixture<AdminClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminClassComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
