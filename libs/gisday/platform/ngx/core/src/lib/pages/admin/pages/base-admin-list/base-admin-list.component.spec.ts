import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseAdminListComponent } from './base-admin-list.component';

describe('BaseAdminListComponent', () => {
  let component: BaseAdminListComponent;
  let fixture: ComponentFixture<BaseAdminListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BaseAdminListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseAdminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
