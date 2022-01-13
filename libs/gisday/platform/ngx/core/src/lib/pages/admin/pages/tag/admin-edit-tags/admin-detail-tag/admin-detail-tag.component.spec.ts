import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDetailTagComponent } from './admin-detail-tag.component';

describe('AdminDetailTagComponent', () => {
  let component: AdminDetailTagComponent;
  let fixture: ComponentFixture<AdminDetailTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDetailTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDetailTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
