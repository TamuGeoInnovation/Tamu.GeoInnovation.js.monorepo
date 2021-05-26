import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StormwaterComponent } from './stormwater.component';

describe('StormwaterComponent', () => {
  let component: StormwaterComponent;
  let fixture: ComponentFixture<StormwaterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StormwaterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StormwaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
