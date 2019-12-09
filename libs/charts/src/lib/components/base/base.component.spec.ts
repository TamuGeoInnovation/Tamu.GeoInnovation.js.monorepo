import { async, inject, TestBed } from '@angular/core/testing';

import { BaseChartComponent } from './base.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChartConfiguration, ChartContainerComponent } from '../chart-container/chart-container.component';
import { exitCodeFromResult } from '@angular/compiler-cli';

describe('BaseChartComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ providers: [BaseChartComponent] }).compileComponents();
  }));

  it('should create', inject([BaseChartComponent], (baseChartComponent: BaseChartComponent) => {
    expect(baseChartComponent).toBeTruthy();
  }));

  it('ngOnInit should error on illegal config', inject([BaseChartComponent], (baseChartComponent: BaseChartComponent) => {
    expect(() => baseChartComponent.ngOnInit()).toThrow(new Error('Subclass does not contain chart container.'));
  }));

  it('ngAfterViewInit should error on illegal config', inject(
    [BaseChartComponent],
    (baseChartComponent: BaseChartComponent) => {
      expect(() => baseChartComponent.ngAfterViewInit()).toThrow(new Error('No chart data source provided.'));
    }
  ));

  it('should initialize with valid input', (done) => {
    inject([BaseChartComponent], (baseChartComponent: BaseChartComponent) => {
      const fake_sources = new BehaviorSubject<string[]>(['test']);
      baseChartComponent.transformations = [['count']];
      baseChartComponent.paths = [['count']];
      baseChartComponent.labels = ['Count'];
      baseChartComponent.baseConfig = new ChartConfiguration();
      baseChartComponent.source = fake_sources.asObservable();
      baseChartComponent.chart = ({
        create: (config: Observable<ChartConfiguration> | ChartConfiguration) => {
          expect(config).toBeInstanceOf(Observable);

          if (!(config instanceof Observable)) {
            return;
          }

          config.subscribe((chart_config: ChartConfiguration) => {
            const val = chart_config;

            
            expect(chart_config).toEqual({
              ...new ChartConfiguration(),
              data: {
                datasets: [
                  {
                    data: [],
                    label: 'Count'
                  }
                ],
                labels: []
              }
            });
            done();
          });
        }
      } as unknown) as ChartContainerComponent;

      baseChartComponent.ngAfterViewInit();
    })();
  });

  it('should error with invalid transformation', inject([BaseChartComponent], (baseChartComponent: BaseChartComponent) => {
    expect(() =>
      ((baseChartComponent as unknown) as { valueForTransformationSet: Function }).valueForTransformationSet('invalid')
    ).toThrowError(new Error('Invalid chart operator: invalid'));
  }));
});
