import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { LegendElementComponent } from './legend-element.component';

describe('LegendElementComponent', () => {
  let component: LegendElementComponent;
  let fixture: ComponentFixture<LegendElementComponent>;

  beforeEach(async () => {
    const spy = {
      require: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [LegendElementComponent],
      providers: [{ provide: EsriModuleProviderService, useValue: spy }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegendElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use the safety first warning label for sports safety layers', () => {
    component.layer = {
      id: 'softball-parking-safety-first'
    } as __esri.Layer;

    expect(component.getSportsSafetyFirstLegendLabel()).toBe('Please use marked crosswalks. No mid-street crossing.');
  });
});
