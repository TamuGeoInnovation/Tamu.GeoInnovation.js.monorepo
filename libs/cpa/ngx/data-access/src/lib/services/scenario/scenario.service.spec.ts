import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { ScenarioService } from './scenario.service';

const mockEnvironment = {
  value: jest.fn()
};

describe('ScenarioService', () => {
  let service: ScenarioService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ScenarioService,
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
  it('should call create() and return a new scenario', () => {
    const dummyStringValue = 'Foo';
    const dummyResponse = [
      {
        name: 'Foo',
        workshops: []
      }
    ];

    mockEnvironment.value.mockReturnValue(dummyStringValue);
    service = TestBed.inject(ScenarioService);

    service.create({}).subscribe((response) => {
      expect(response[0].name).toBe('Foo');
    });

    const req = httpTestingController.expectOne({ method: 'POST', url: `${'Fooscenarios'}` });
    req.flush(dummyResponse);
  });
});
