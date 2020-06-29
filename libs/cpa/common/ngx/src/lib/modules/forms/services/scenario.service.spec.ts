import { TestBed } from '@angular/core/testing';

import { ScenarioService } from './scenario.service';

describe('ScenarioService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScenarioService = TestBed.get(ScenarioService);
    expect(service).toBeTruthy();
  });
});
