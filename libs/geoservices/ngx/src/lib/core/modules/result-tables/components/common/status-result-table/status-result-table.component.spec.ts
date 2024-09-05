import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusResultTableComponent } from './status-result-table.component';

describe('StatusResultTableComponent', () => {
  let component: StatusResultTableComponent;
  let fixture: ComponentFixture<StatusResultTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatusResultTableComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusResultTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
