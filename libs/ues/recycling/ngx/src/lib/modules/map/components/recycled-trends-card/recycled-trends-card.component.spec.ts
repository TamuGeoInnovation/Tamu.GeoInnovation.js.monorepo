import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecycledTrendsCardComponent } from './recycled-trends-card.component';

describe('RecycledTrendsCardComponent', () => {
  let component: RecycledTrendsCardComponent;
  let fixture: ComponentFixture<RecycledTrendsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecycledTrendsCardComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecycledTrendsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
