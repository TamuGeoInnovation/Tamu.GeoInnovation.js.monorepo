import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDetailSponsorComponent } from './admin-detail-sponsor.component';

describe('AdminDetailSponsorComponent', () => {
  let component: AdminDetailSponsorComponent;
  let fixture: ComponentFixture<AdminDetailSponsorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDetailSponsorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDetailSponsorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
