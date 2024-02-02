import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorAddEditFormComponent } from './sponsor-add-edit-form.component';

describe('SponsorAddEditFormComponent', () => {
  let component: SponsorAddEditFormComponent;
  let fixture: ComponentFixture<SponsorAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SponsorAddEditFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsorAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
