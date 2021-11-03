import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnapshotListItemComponent } from './snapshot-list-item.component';

describe('SnapshotListItemComponent', () => {
  let component: SnapshotListItemComponent;
  let fixture: ComponentFixture<SnapshotListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SnapshotListItemComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnapshotListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
