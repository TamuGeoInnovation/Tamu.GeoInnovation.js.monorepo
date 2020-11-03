import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveLayersControlComponent } from './live-layers-control.component';

describe('LiveLayersControlComponent', () => {
  let component: LiveLayersControlComponent;
  let fixture: ComponentFixture<LiveLayersControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveLayersControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveLayersControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
