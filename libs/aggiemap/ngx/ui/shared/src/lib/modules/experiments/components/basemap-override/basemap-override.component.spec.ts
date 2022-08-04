import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasemapOverrideComponent } from './basemap-override.component';

describe('BasemapOverrideComponent', () => {
  let component: BasemapOverrideComponent;
  let fixture: ComponentFixture<BasemapOverrideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BasemapOverrideComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasemapOverrideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
