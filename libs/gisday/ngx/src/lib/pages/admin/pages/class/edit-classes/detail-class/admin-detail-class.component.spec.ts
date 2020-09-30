import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDetailClassComponent } from './admin-detail-class.component';

describe('AdminDetailClassComponent', () => {
  let component: AdminDetailClassComponent;
  let fixture: ComponentFixture<AdminDetailClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminDetailClassComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDetailClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
