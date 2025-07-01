import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceFeatureAttributeListComponent } from './reference-feature-attribute-list.component';

describe('ReferenceFeatureAttributeListComponent', () => {
  let component: ReferenceFeatureAttributeListComponent;
  let fixture: ComponentFixture<ReferenceFeatureAttributeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferenceFeatureAttributeListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceFeatureAttributeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
