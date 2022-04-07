import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { ParticipantService } from './participants.service';

const mockEnvironment = {
  value: jest.fn()
};

describe('ParticipantService', () => {
  let service: ParticipantService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ParticipantService,
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

  it('should call createParticipantForWorkshop() and return a new participant', () => {
    const dummyStringValue = 'Foo';
    const dummyResponse = [
      {
        name: 'Foo',
        workshops: []
      }
    ];

    mockEnvironment.value.mockReturnValue(dummyStringValue);
    service = TestBed.inject(ParticipantService);

    service.createParticipantForWorkshop(dummyStringValue, dummyStringValue).subscribe((participants) => {
      expect(participants[0].name).toBe('Foo');
    });

    const req = httpTestingController.expectOne({ method: 'POST', url: `${service.resource}/workshop` });
    req.flush(dummyResponse);
  });

  it('should call getParticipantsForWorkshop() and return a list of participants', () => {
    const dummyStringValue = 'Foo';
    const dummyResponse = [
      {
        name: 'Foo',
        workshops: []
      }
    ];

    mockEnvironment.value.mockReturnValue(dummyStringValue);
    service = TestBed.inject(ParticipantService);

    service.getParticipantsForWorkshop(dummyStringValue).subscribe((participants) => {
      expect(participants[0].name).toBe('Foo');
      expect(participants.length).toBe(1);
    });

    const req = httpTestingController.expectOne({ method: 'GET', url: `${service.resource}/workshop/${dummyStringValue}` });
    req.flush(dummyResponse);
  });
});
