import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { SnapshotService } from './snapshot.service';

const mockEnvironment = {
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
          useValue: mockEnvironment
        }
      ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    jest.resetAllMocks();
  });
  it('create()', () => {
    const dummyStringValue = 'Foo';
    const dummyResponse = [
      {
        name: 'Foo',
        workshops: []
      }
    ];

    mockEnvironment.value.mockReturnValue(dummyStringValue);
    service = TestBed.inject(SnapshotService);

    service.create({}).subscribe((response) => {
      expect(response[0].name).toBe('Foo');
    });

    const req = httpTestingController.expectOne('Foosnapshots');
    expect(req.request.method).toEqual('POST');
    req.flush(dummyResponse);
  });
});
