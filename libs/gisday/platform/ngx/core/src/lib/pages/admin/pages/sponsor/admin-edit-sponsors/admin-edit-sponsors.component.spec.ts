import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditSponsorsComponent } from './admin-edit-sponsors.component';

describe('AdminEditSponsorsComponent', () => {
  let component: AdminEditSponsorsComponent;
  let fixture: ComponentFixture<AdminEditSponsorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminEditSponsorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditSponsorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
