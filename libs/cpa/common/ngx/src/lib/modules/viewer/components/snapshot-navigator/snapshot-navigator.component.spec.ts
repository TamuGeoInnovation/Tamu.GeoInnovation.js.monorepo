import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnapshotNavigatorComponent } from './snapshot-navigator.component';

describe('SnapshotNavigatorComponent', () => {
  let component: SnapshotNavigatorComponent;
  let fixture: ComponentFixture<SnapshotNavigatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnapshotNavigatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnapshotNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
