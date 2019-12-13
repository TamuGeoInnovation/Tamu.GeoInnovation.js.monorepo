import { async, TestBed } from '@angular/core/testing';
import { AggiemapModule } from './aggiemap.module';

describe('AggiemapModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AggiemapModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(AggiemapModule).toBeDefined();
  });
});
