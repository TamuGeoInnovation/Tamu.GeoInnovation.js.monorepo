import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonfireModalComponent } from './bonfire-modal.component';

describe('BonfireModalComponent', () => {
  let component: BonfireModalComponent;
  let fixture: ComponentFixture<BonfireModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BonfireModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BonfireModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
