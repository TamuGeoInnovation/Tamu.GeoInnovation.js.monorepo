import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryStatusFragmentComponent } from './query-status-fragment.component';

describe('QueryStatusFragmentComponent', () => {
  let component: QueryStatusFragmentComponent;
  let fixture: ComponentFixture<QueryStatusFragmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QueryStatusFragmentComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryStatusFragmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
