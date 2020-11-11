import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnapshotsListComponent } from './snapshots-list.component';

describe('SnapshotsListComponent', () => {
  let component: SnapshotsListComponent;
  let fixture: ComponentFixture<SnapshotsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnapshotsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnapshotsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
