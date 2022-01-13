import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseAdminViewComponent } from './base-admin-view.component';

describe('BaseAdminViewComponent', () => {
  let component: BaseAdminViewComponent;
  let fixture: ComponentFixture<BaseAdminViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseAdminViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseAdminViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
