import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CpaAdminComponent } from './cpa-admin.component';

describe('CpaAdminComponent', () => {
  let component: CpaAdminComponent;
  let fixture: ComponentFixture<CpaAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpaAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpaAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
