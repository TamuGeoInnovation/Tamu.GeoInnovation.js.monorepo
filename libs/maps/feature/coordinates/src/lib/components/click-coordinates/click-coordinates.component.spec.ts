import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickCoordinatesComponent } from './click-coordinates.component';

describe('ClickCoordinatesComponent', () => {
  let component: ClickCoordinatesComponent;
  let fixture: ComponentFixture<ClickCoordinatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClickCoordinatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClickCoordinatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
