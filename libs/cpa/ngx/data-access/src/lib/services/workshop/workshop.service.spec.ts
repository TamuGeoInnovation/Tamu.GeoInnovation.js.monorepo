import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { WorkshopService } from './workshop.service';

const mockEnvironment = {
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
          useValue: mockEnvironment
        }
      ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should call createWorkshop() and return a new workshop', () => {
    const dummyStringValue = 'Foo';
    const dummyResponse = [
      {
        name: 'Foo',
        workshops: []
      }
    ];

    mockEnvironment.value.mockReturnValue(dummyStringValue);
    service = TestBed.inject(WorkshopService);

    service.createWorkshop({ guid: 'bruh' }).subscribe((response) => {
      expect(response[0].name).toBe('Foo');
    });

    const req = httpTestingController.expectOne({ method: 'POST', url: 'Fooworkshops' });
    req.flush(dummyResponse);
  });
});
