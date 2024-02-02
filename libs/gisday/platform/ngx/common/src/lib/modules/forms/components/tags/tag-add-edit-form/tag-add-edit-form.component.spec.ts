import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagAddEditFormComponent } from './tag-add-edit-form.component';

describe('TagAddEditFormComponent', () => {
  let component: TagAddEditFormComponent;
  let fixture: ComponentFixture<TagAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagAddEditFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
