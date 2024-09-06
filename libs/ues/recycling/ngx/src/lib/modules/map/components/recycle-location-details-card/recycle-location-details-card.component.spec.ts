import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecycleLocationDetailsCardComponent } from './recycle-location-details-card.component';

describe('RecycleLocationDetailsCardComponent', () => {
  let component: RecycleLocationDetailsCardComponent;
  let fixture: ComponentFixture<RecycleLocationDetailsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecycleLocationDetailsCardComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecycleLocationDetailsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
