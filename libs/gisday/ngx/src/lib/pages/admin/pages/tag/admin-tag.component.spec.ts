import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTagComponent } from './admin-tag.component';

describe('AdminTagComponent', () => {
  let component: AdminTagComponent;
  let fixture: ComponentFixture<AdminTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
