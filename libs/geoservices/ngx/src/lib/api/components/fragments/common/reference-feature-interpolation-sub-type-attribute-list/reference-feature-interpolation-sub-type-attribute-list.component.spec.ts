import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceFeatureInterpolationSubTypeAttributeListComponent } from './reference-feature-interpolation-sub-type-attribute-list.component';

describe('ReferenceFeatureInterpolationSubTypeAttributeListComponent', () => {
  let component: ReferenceFeatureInterpolationSubTypeAttributeListComponent;
  let fixture: ComponentFixture<ReferenceFeatureInterpolationSubTypeAttributeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferenceFeatureInterpolationSubTypeAttributeListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceFeatureInterpolationSubTypeAttributeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
