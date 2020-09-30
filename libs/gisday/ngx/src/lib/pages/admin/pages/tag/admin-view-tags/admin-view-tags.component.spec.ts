import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewTagsComponent } from './admin-view-tags.component';

describe('AdminViewTagsComponent', () => {
  let component: AdminViewTagsComponent;
  let fixture: ComponentFixture<AdminViewTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminViewTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
