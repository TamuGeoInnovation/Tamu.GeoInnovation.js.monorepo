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

  it('createWorkshop()', () => {
    const dummyStringValue = 'Foo';
    const dummyResponse = [
      {
        name: 'Foo',
        workshops: []
      }
    ];

    spyEnvironment.value.mockReturnValue(dummyStringValue);
    service = TestBed.inject(WorkshopService);

    service.createWorkshop({ guid: 'bruh' }).subscribe((response) => {
      expect(response[0].name).toBe('Foo');
    });

    const req = httpTestingController.expectOne('Fooworkshops');
    expect(req.request.method).toEqual('POST');
    req.flush(dummyResponse);
  });
});
