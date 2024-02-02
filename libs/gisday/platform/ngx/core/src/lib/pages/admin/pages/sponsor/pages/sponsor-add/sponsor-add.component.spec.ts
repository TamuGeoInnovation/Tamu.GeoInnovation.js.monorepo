import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorAddComponent } from './sponsor-add.component';

describe('SponsorAddComponent', () => {
  let component: SponsorAddComponent;
  let fixture: ComponentFixture<SponsorAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SponsorAddComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsorAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
