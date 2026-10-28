import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { LeaderboardService, SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SubmissionReviewDto } from '@tamu-gisc/gisday/competitions/data-api/types';

import { AdminSubmissionsComponent } from './admin-submissions.component';

describe('AdminSubmissionsComponent', () => {
  let component: AdminSubmissionsComponent;
  let fixture: ComponentFixture<AdminSubmissionsComponent>;
  let mockSubmissionService: jest.Mocked<SubmissionService>;
  let mockLeaderboardService: jest.Mocked<LeaderboardService>;

  const row = (guid: string, userGuid: string, validationStatus: string, reviewReasons: Array<string> = []) =>
    ({ guid, userGuid, validationStatus, reviewReasons }) as unknown as SubmissionReviewDto;

  const rows = [
    row('ann-1', 'auth0|ann', 'verified'),
    row('ann-2', 'auth0|ann', 'unverified', ['No photo']),
    row('bob-1', 'auth0|bob', 'verified'),
    row('cat-1', 'auth0|cat', 'discarded'),
    row('dan-1', 'auth0|dan', 'unverified'),
    row('eve-1', 'auth0|eve', 'verified')
  ];

  const shown = async () => (await firstValueFrom(component.submissions$)).map((s) => s.guid);

  beforeEach(async () => {
    mockSubmissionService = {
      getAdminSubmissions: jest.fn().mockReturnValue(of(rows)),
      publishToArcgis: jest.fn().mockReturnValue(of({ queued: 5 }))
    } as unknown as jest.Mocked<SubmissionService>;

    // Ann leads; Bob and Dan tie for second; Eve is fourth.
    mockLeaderboardService = {
      getScoresForActive: jest.fn().mockReturnValue(
        of([
          { guid: 'auth0|ann', identity: 'ann', points: 9 },
          { guid: 'auth0|bob', identity: 'bob', points: 6 },
          { guid: 'auth0|dan', identity: 'dan', points: 6 },
          { guid: 'auth0|eve', identity: 'eve', points: 2 }
        ])
      )
    } as unknown as jest.Mocked<LeaderboardService>;

    await TestBed.configureTestingModule({
      imports: [AdminSubmissionsComponent],
      providers: [
        { provide: SubmissionService, useValue: mockSubmissionService },
        { provide: LeaderboardService, useValue: mockLeaderboardService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSubmissionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch admin submissions on init', () => {
    component.ngOnInit();
    expect(mockSubmissionService.getAdminSubmissions).toHaveBeenCalled();
  });

  /**
   * #2164: the app reviews each submission as it arrives, so a person looks only at what it left for
   * them, and at the top finishers' submissions before prizes are awarded.
   */
  it('shows every submission at first', async () => {
    component.ngOnInit();

    expect(await shown()).toEqual(['ann-1', 'ann-2', 'bob-1', 'cat-1', 'dan-1', 'eve-1']);
  });

  it('shows only the unverified submissions under Needs a look', async () => {
    component.ngOnInit();
    component.show('needs-a-look');

    expect(await shown()).toEqual(['ann-2', 'dan-1']);
  });

  it("shows the top three places' submissions under Top finishers, ties included, without discarded ones", async () => {
    component.ngOnInit();
    component.show('top-finishers');

    expect(await shown()).toEqual(['ann-1', 'ann-2', 'bob-1', 'dan-1']);
  });

  /**
   * #2433: an admin can send everything to ArcGIS Online again, after an outage or once publishing is
   * switched on. It runs in the background on the server, so the page says it has started (#2434 review).
   */
  it('starts publishing the season to ArcGIS Online and says how many', async () => {
    component.ngOnInit();
    component.publishToArcgis();

    expect(mockSubmissionService.publishToArcgis).toHaveBeenCalled();
    expect(component.arcgisResult()).toBe(
      'Publishing 5 submissions to ArcGIS Online in the background. Each failure is in the API log; running it again is safe.'
    );
  });

  it('says so when publishing is already running', async () => {
    mockSubmissionService.publishToArcgis.mockReturnValue(of({ queued: 0, alreadyRunning: true }) as never);

    component.ngOnInit();
    component.publishToArcgis();

    expect(component.arcgisResult()).toBe('Already publishing to ArcGIS Online. Try again once it has finished.');
  });

  it('says so when publishing is not set up', async () => {
    mockSubmissionService.publishToArcgis.mockReturnValue(of({ queued: 0, configured: false }) as never);

    component.ngOnInit();
    component.publishToArcgis();

    expect(component.arcgisResult()).toBe('Publishing to ArcGIS Online is not set up on this server.');
  });
});
