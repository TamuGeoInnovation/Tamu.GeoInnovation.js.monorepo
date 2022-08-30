import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceFeatureInterpolationTypeAttributeListComponent } from './reference-feature-interpolation-type-attribute-list.component';

describe('ReferenceFeatureInterpolationTypeAttributeListComponent', () => {
  let component: ReferenceFeatureInterpolationTypeAttributeListComponent;
  let fixture: ComponentFixture<ReferenceFeatureInterpolationTypeAttributeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferenceFeatureInterpolationTypeAttributeListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceFeatureInterpolationTypeAttributeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
