import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';

import { LeaderboardService, SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { SubmissionReviewDto } from '@tamu-gisc/gisday/competitions/data-api/types';

import { AdminSubmissionsComponent, submissionCounts } from './admin-submissions.component';

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
      publishToArcgis: jest.fn().mockReturnValue(of({ queued: 5 })),
      getSeasonExportZip: jest.fn().mockReturnValue(of(new Blob(['zip'])))
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

  // #545: every submission, its answers and its photos, as one zip the admins can hand to the project's partners.
  describe('the export (#545)', () => {
    const button = () =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find((b) =>
        b.textContent.includes('Download all as a zip')
      );

    beforeEach(() => {
      (URL as unknown as { createObjectURL: unknown }).createObjectURL = jest.fn(() => 'blob:made-up');
      (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = jest.fn();
    });

    it("downloads the season's submissions as one zip from a button beside Publish to ArcGIS", () => {
      const clicks = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
      fixture.detectChanges();

      button().click();
      fixture.detectChanges();

      expect(mockSubmissionService.getSeasonExportZip).toHaveBeenCalled();
      expect(clicks).toHaveBeenCalled();
      expect(component.exportProblem()).toBeNull();
      clicks.mockRestore();
    });

    it('says when there is nothing to export, rather than saving an empty file', () => {
      mockSubmissionService.getSeasonExportZip.mockReturnValue(throwError(() => ({ status: 404 })) as never);
      fixture.detectChanges();

      button().click();
      fixture.detectChanges();

      expect(component.exportProblem()).toBe('This season has no VGI submissions to export.');
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('This season has no VGI submissions to export.');
    });
  });
});

/**
 * #3244, decided by the maintainer: a table above the list, a row per category and a Total row, with how many
 * submissions, verified, needing a look and discarded. It counts every submission this season, whichever view is
 * pressed. Made-up submissions only.
 */
describe('AdminSubmissionsComponent counts (#3244)', () => {
  const row = (guid: string, questionValue: string, validationStatus: string) =>
    ({
      guid,
      userGuid: `auth0|${guid}`,
      questionValue,
      validationStatus,
      reviewReasons: []
    }) as unknown as SubmissionReviewDto;

  const rows = [
    row('a', 'Plaque', 'verified'),
    row('b', 'Plaque', 'unverified'),
    row('c', 'Bench', 'verified'),
    row('d', 'Plaque', 'discarded'),
    row('e', '', 'unverified'),
    row('f', 'Bench', 'verified')
  ];

  it('counts each category, by name, the uncategorized last, and all of them', () => {
    expect(submissionCounts(rows)).toEqual({
      rows: [
        { category: 'Bench', submissions: 2, verified: 2, unverified: 0, discarded: 0 },
        { category: 'Plaque', submissions: 3, verified: 1, unverified: 1, discarded: 1 },
        { category: 'No category', submissions: 1, verified: 0, unverified: 1, discarded: 0 }
      ],
      total: { category: 'Total', submissions: 6, verified: 3, unverified: 2, discarded: 1 }
    });
  });

  it('shows the table above the list, and keeps its counts whichever view is pressed', async () => {
    TestBed.configureTestingModule({
      imports: [AdminSubmissionsComponent],
      providers: [
        { provide: SubmissionService, useValue: { getAdminSubmissions: () => of(rows), publishToArcgis: jest.fn() } },
        { provide: LeaderboardService, useValue: { getScoresForActive: () => of([]) } }
      ]
    });

    const fixture = TestBed.createComponent(AdminSubmissionsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const table = () => root.querySelector('table.submission-counts');
    const cells = () =>
      Array.from(table().querySelectorAll('tr')).map((tr) =>
        Array.from(tr.querySelectorAll('th, td')).map((c) => c.textContent.trim())
      );
    const before = cells();

    expect(before).toEqual([
      ['Category', 'Submissions', 'Verified', 'Needs a look', 'Discarded'],
      ['Bench', '2', '2', '0', '0'],
      ['Plaque', '3', '1', '1', '1'],
      ['No category', '1', '0', '1', '0'],
      ['Total', '6', '3', '2', '1']
    ]);
    // Above the list.
    expect(table().compareDocumentPosition(root.querySelector('tamu-gisc-submission-review-list'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );

    fixture.componentInstance.show('needs-a-look');
    fixture.detectChanges();

    expect(cells()).toEqual(before);
  });

  // On a 360 or 390 px phone the table is 377 px wide at its narrowest, every heading one word, and the page's column
  // about 330 px: the page scrolled sideways (the laptop's report 4). The table now scrolls in the admin dashboards' own
  // box, whose specs show it scrolls content wider than itself, so the page does not.
  it('puts the table in the shared scroll box, so on a phone the table scrolls and the page does not', async () => {
    TestBed.configureTestingModule({
      imports: [AdminSubmissionsComponent],
      providers: [
        { provide: SubmissionService, useValue: { getAdminSubmissions: () => of(rows), publishToArcgis: jest.fn() } },
        { provide: LeaderboardService, useValue: { getScoresForActive: () => of([]) } }
      ]
    });

    const fixture = TestBed.createComponent(AdminSubmissionsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const table = (fixture.nativeElement as HTMLElement).querySelector('table.submission-counts');

    expect(table.closest('tamu-gisc-dashboard-scroll')).not.toBeNull();
    // Inside the box's own element that scrolls sideways, not beside it.
    expect(table.parentElement.classList).toContain('dashboard-scroll');
  });
});
