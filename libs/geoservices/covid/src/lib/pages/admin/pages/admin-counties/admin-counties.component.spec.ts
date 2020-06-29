import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCountiesComponent } from './admin-counties.component';

describe('AdminCountiesComponent', () => {
  let component: AdminCountiesComponent;
  let fixture: ComponentFixture<AdminCountiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCountiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCountiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
