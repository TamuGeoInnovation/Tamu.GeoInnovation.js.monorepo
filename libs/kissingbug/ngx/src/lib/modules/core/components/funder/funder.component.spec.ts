import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunderComponent } from './funder.component';

describe('FunderComponent', () => {
  let component: FunderComponent;
  let fixture: ComponentFixture<FunderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FunderComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FunderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
