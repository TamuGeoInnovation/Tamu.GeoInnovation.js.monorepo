import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnapshotBuilderComponent } from './snapshot-builder.component';

describe('SnapshotBuilderComponent', () => {
  let component: SnapshotBuilderComponent;
  let fixture: ComponentFixture<SnapshotBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnapshotBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnapshotBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
