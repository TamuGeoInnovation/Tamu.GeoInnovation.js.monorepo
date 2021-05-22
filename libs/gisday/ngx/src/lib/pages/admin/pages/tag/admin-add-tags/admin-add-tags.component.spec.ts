import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddTagsComponent } from './admin-add-tags.component';

describe('AdminAddTagsComponent', () => {
  let component: AdminAddTagsComponent;
  let fixture: ComponentFixture<AdminAddTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAddTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
