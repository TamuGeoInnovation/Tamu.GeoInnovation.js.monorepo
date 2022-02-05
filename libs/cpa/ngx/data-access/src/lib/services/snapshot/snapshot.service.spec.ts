import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { SnapshotService } from './snapshot.service';

const spyEnvironment = {
  value: jest.fn()
};

describe('SnapshotService', () => {
  let service: SnapshotService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SnapshotService,
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
    jest.resetAllMocks();
  });
  it('should be created', () => {
    service = TestBed.inject(SnapshotService);
    expect(service).toBeTruthy();
  });
});
