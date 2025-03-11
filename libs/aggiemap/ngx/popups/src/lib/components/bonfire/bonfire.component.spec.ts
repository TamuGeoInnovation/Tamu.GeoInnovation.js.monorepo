import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonfireComponent } from './bonfire.component';

describe('BonfireComponent', () => {
  let component: BonfireComponent;
  let fixture: ComponentFixture<BonfireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BonfireComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BonfireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
