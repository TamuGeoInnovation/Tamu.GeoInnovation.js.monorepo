import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerProgramFormComponent } from './partner-program-form.component';

describe('PartnerProgramFormComponent', () => {
  let component: PartnerProgramFormComponent;
  let fixture: ComponentFixture<PartnerProgramFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PartnerProgramFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerProgramFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
