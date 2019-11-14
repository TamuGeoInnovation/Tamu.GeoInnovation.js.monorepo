import { async, inject, TestBed } from '@angular/core/testing';

import { RouterHistoryService } from './router-history.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('RouterHistoryService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [RouterHistoryService],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  it('should be created', inject([RouterHistoryService], (service: RouterHistoryService) => {
    expect(service).toBeTruthy();
  }));
});
