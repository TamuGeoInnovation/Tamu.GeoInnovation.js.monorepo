import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastEditComponent } from './broadcast-edit.component';

describe('BroadcastEditComponent', () => {
  let component: BroadcastEditComponent;
  let fixture: ComponentFixture<BroadcastEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BroadcastEditComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BroadcastEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
