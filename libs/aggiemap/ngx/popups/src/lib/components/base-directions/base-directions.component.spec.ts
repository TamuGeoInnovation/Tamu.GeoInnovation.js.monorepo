import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseDirectionsComponent } from './base-directions.component';

describe('BaseDirectionsComponent', () => {
  let component: BaseDirectionsComponent;
  let fixture: ComponentFixture<BaseDirectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BaseDirectionsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseDirectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
