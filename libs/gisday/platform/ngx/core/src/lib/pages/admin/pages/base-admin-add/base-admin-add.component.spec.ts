import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseAdminAddComponent } from './base-admin-add.component';

describe('BaseAdminAddComponent', () => {
  let component: BaseAdminAddComponent;
  let fixture: ComponentFixture<BaseAdminAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BaseAdminAddComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseAdminAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
