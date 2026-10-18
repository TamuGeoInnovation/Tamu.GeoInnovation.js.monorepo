import { waitForAsync, inject, TestBed } from '@angular/core/testing';

import { BaseChartComponent } from './base.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChartConfiguration, ChartContainerComponent } from '../chart-container/chart-container.component';

describe('BaseChartComponent', () => {
  beforeEach(waitForAsync(() => {
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
    const fixture = TestBed.createComponent(BaseChartComponent);
    const baseChartComponent = fixture.componentInstance;
    const fake_sources = new BehaviorSubject<string[]>(['test']);
    fixture.componentRef.setInput('transformations', [['count']]);
    fixture.componentRef.setInput('paths', [['count']]);
    fixture.componentRef.setInput('labels', ['Count']);
    fixture.componentRef.setInput('source', fake_sources.asObservable());
    baseChartComponent.baseConfig = new ChartConfiguration();

    // The base class has no chart container of its own, so the query is replaced with a stand-in.
    const chart = {
      create: (config: Observable<ChartConfiguration> | ChartConfiguration) => {
        expect(config).toBeInstanceOf(Observable);

        if (!(config instanceof Observable)) {
          return;
        }

        config.subscribe((chart_config: ChartConfiguration) => {
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
    } as unknown as ChartContainerComponent;

    Object.defineProperty(baseChartComponent, 'chart', { value: () => chart });

    baseChartComponent.ngAfterViewInit();
  });

  it('should error with invalid transformation', inject([BaseChartComponent], (baseChartComponent: BaseChartComponent) => {
    expect(() =>
      (baseChartComponent as unknown as { evaluateTransformSet: (set, paths, collection) => [] }).evaluateTransformSet(
        'invalidSet',
        'invalidPath',
        'invalidCollection'
      )
    ).toThrow(new Error('Invalid chart operator: invalidSet'));
  }));
});
