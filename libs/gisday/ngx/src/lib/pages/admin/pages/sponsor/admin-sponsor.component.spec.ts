import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSponsorComponent } from './admin-sponsor.component';

describe('AdminSponsorComponent', () => {
  let component: AdminSponsorComponent;
  let fixture: ComponentFixture<AdminSponsorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminSponsorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSponsorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
