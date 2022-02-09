import { fakeAsync, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { ParticipantService } from './participants.service';

const spyEnvironment = {
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
          useValue: spyEnvironment
        }
      ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('createParticipantForWorkshop()', () => {
    const dummyStringValue = 'Foo';
    const dummyResponse = [
      {
        name: 'Foo',
        workshops: []
      }
    ];

    spyEnvironment.value.mockReturnValue(dummyStringValue);
    service = TestBed.inject(ParticipantService);

    service.createParticipantForWorkshop(dummyStringValue, dummyStringValue).subscribe((participants) => {
      expect(participants[0].name).toBe('Foo');
    });

    const req = httpTestingController.expectOne(`${service.resource}/workshop`);
    expect(req.request.method).toEqual('POST');
    req.flush(dummyResponse);
  });

  it('getParticipantsForWorkshop()', () => {
    const dummyStringValue = 'Foo';
    const dummyResponse = [
      {
        name: 'Foo',
        workshops: []
      }
    ];

    spyEnvironment.value.mockReturnValue(dummyStringValue);
    service = TestBed.inject(ParticipantService);

    service.getParticipantsForWorkshop(dummyStringValue).subscribe((participants) => {
      expect(participants[0].name).toBe('Foo');
      expect(participants.length).toBe(1);
    });

    const req = httpTestingController.expectOne(`${service.resource}/workshop/${dummyStringValue}`);
    expect(req.request.method).toEqual('GET');
    req.flush(dummyResponse);
  });
});
