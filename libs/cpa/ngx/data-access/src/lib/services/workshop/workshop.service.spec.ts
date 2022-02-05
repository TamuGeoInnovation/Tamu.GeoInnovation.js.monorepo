import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { WorkshopService } from './workshop.service';

const spyEnvironment = {
  value: jest.fn()
};

describe('WorkshopService', () => {
  let service: WorkshopService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WorkshopService,
        {
          provide: EnvironmentService,
          useValue: spyEnvironment
        }
      ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    service = TestBed.inject(WorkshopService);
    expect(service).toBeTruthy();
  });
});
