import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewSponsorsComponent } from './admin-view-sponsors.component';

describe('AdminViewSponsorsComponent', () => {
  let component: AdminViewSponsorsComponent;
  let fixture: ComponentFixture<AdminViewSponsorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminViewSponsorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewSponsorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
