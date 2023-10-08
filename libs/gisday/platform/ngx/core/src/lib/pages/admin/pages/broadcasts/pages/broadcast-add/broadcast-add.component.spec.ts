import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastAddComponent } from './broadcast-add.component';

describe('BroadcastAddComponent', () => {
  let component: BroadcastAddComponent;
  let fixture: ComponentFixture<BroadcastAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BroadcastAddComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BroadcastAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

