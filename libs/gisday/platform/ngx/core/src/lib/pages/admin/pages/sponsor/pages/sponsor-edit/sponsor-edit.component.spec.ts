import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorEditComponent } from './sponsor-edit.component';

describe('SponsorEditComponent', () => {
  let component: SponsorEditComponent;
  let fixture: ComponentFixture<SponsorEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SponsorEditComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
