import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { ResponseService } from './response.service';

const mockEnvironment = {
  value: jest.fn()
};

describe('ResponseService', () => {
  let service: ResponseService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ResponseService,
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

  it('should call createResponse() and return a new response', () => {
    const dummyStringValue = 'Foo';
    const dummyResponse = [
      {
        name: 'Foo',
        workshops: []
      }
    ];

    mockEnvironment.value.mockReturnValue(dummyStringValue);
    service = TestBed.inject(ResponseService);

    service.createResponse({ shapes: { Foo: 'Foo' } }).subscribe((response) => {
      expect(response[0].name).toBe('Foo');
    });

    const req = httpTestingController.expectOne({ method: 'POST', url: `${service.resource}` });
    req.flush(dummyResponse);
  });
});
