import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastAddEditFormComponent } from './broadcast-add-edit-form.component';

describe('BroadcastAddEditFormComponent', () => {
  let component: BroadcastAddEditFormComponent;
  let fixture: ComponentFixture<BroadcastAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BroadcastAddEditFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BroadcastAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
