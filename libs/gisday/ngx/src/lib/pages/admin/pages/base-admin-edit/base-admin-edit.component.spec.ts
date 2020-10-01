import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseAdminEditComponent } from './base-admin-edit.component';

describe('BaseAdminEditComponent', () => {
  let component: BaseAdminEditComponent;
  let fixture: ComponentFixture<BaseAdminEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseAdminEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseAdminEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
