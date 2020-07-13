import { async, TestBed } from '@angular/core/testing';
import { CommonUtilsDeviceGuardsModule } from './common-utils-device-guards.module';

describe('CommonUtilsDeviceGuardsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonUtilsDeviceGuardsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CommonUtilsDeviceGuardsModule).toBeDefined();
  });
});
