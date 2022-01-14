import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorsTamuComponent } from './sponsors-tamu.component';

describe('SponsorsTamuComponent', () => {
  let component: SponsorsTamuComponent;
  let fixture: ComponentFixture<SponsorsTamuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SponsorsTamuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsorsTamuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
