import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';

describe('TableComponent', () => {
  let component: TableComponent<Record<string, unknown>>;
  let fixture: ComponentFixture<TableComponent<Record<string, unknown>>>; // Replace 'any' with the appropriate type argument.

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
