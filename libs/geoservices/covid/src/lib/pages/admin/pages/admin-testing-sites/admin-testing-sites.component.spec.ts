import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTestingSitesComponent } from './admin-testing-sites.component';

describe('AdminTestingSitesComponent', () => {
  let component: AdminTestingSitesComponent;
  let fixture: ComponentFixture<AdminTestingSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminTestingSitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTestingSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
