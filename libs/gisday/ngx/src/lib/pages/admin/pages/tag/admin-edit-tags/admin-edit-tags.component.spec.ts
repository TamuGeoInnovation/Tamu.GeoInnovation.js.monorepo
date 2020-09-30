import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditTagsComponent } from './admin-edit-tags.component';

describe('AdminEditTagsComponent', () => {
  let component: AdminEditTagsComponent;
  let fixture: ComponentFixture<AdminEditTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminEditTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
