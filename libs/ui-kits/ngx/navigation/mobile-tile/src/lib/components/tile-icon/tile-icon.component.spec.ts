import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileIconComponent } from './tile-icon.component';

describe('TileIconComponent', () => {
  let component: TileIconComponent;
  let fixture: ComponentFixture<TileIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
