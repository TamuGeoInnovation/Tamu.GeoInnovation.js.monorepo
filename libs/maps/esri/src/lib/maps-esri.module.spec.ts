import { async, TestBed } from '@angular/core/testing';
import { EsriMapModule } from './maps-esri.module';

describe('EsriMapModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [EsriMapModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(EsriMapModule).toBeDefined();
  });
});
