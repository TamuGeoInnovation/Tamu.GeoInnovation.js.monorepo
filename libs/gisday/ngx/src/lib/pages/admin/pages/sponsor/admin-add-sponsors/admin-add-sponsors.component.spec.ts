import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddSponsorsComponent } from './admin-add-sponsors.component';

describe('AdminAddSponsorsComponent', () => {
  let component: AdminAddSponsorsComponent;
  let fixture: ComponentFixture<AdminAddSponsorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAddSponsorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddSponsorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
