import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidewalkComponent } from './sidewalk.component';

describe('SidewalkComponent', () => {
  let component: SidewalkComponent;
  let fixture: ComponentFixture<SidewalkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidewalkComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidewalkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
