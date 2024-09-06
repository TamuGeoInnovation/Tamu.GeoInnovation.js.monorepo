import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseAdminDetailComponent } from './base-admin-detail.component';

describe('BaseAdminDetailComponent', () => {
  let component: BaseAdminDetailComponent;
  let fixture: ComponentFixture<BaseAdminDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BaseAdminDetailComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseAdminDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
