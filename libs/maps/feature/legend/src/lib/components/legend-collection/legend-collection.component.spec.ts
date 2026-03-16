import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegendCollectionComponent } from './legend-collection.component';

describe('LegendCollectionComponent', () => {
  let component: LegendCollectionComponent;
  let fixture: ComponentFixture<LegendCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LegendCollectionComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegendCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles expanded state for groups with children', () => {
    component.group = {
      title: 'Parent Group',
      children: [{ title: 'Child Group' }]
    } as unknown as __esri.ActiveLayerInfo;

    expect(component.hasChildren).toBe(true);
    expect(component.expanded).toBe(true);

    component.toggleExpanded();
    expect(component.expanded).toBe(false);

    component.toggleExpanded();
    expect(component.expanded).toBe(true);
  });

  it('toggles layer visibility', () => {
    component.group = {
      title: 'Parent Group',
      children: [{ title: 'Child Group' }],
      layer: { visible: true }
    } as unknown as __esri.ActiveLayerInfo;
    component.allowVisibilityToggle = true;

    expect(component.isLayerVisible).toBe(true);
    expect(component.isExpanded).toBe(true);

    component.toggleExpanded();
    expect(component.isLayerVisible).toBe(false);
    expect(component.isExpanded).toBe(false);
  });
});
