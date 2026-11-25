import type { Mock } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { UserSubmissionsComponent } from './user-submissions.component';

/**
 * #1791: My VGI Submissions lists the signed-in participant's submissions, asking the API for "mine".
 * It used to read the account id from a `LocalStoreSettings` setting that only the old standalone
 * competitions app had; on the GIS Day site that threw, and the page showed nothing.
 */
describe('UserSubmissionsComponent', () => {
  let fixture: ComponentFixture<UserSubmissionsComponent>;
  let component: UserSubmissionsComponent;
  let submissionService: { getMySubmissions: Mock; getUserSubmissions: Mock };

  const mine = [{ guid: 's-1', userGuid: 'auth0|ann' }];

  beforeEach(async () => {
    submissionService = {
      getMySubmissions: vi.fn(() => of(mine)),
      getUserSubmissions: vi.fn(() => of([]))
    };

    await TestBed.configureTestingModule({
      imports: [UserSubmissionsComponent],
      providers: [
        { provide: SubmissionService, useValue: submissionService },
        // As on the GIS Day site: it has no LocalStoreSettings, and asking for it throws.
        {
          provide: EnvironmentService,
          useValue: {
            value: vi.fn((key: string) => {
              throw new Error(`Environment does not contain a '${key}' token.`);
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserSubmissionsComponent);
    component = fixture.componentInstance;
  });

  it("lists the signed-in participant's own submissions, without the old app's setting", async () => {
    expect(() => component.ngOnInit()).not.toThrow();

    await expect(firstValueFrom(component.submissions$)).resolves.toEqual(mine);
    expect(submissionService.getMySubmissions).toHaveBeenCalledTimes(1);
  });

  it("never asks for someone else's submissions by account id", async () => {
    component.ngOnInit();
    await firstValueFrom(component.submissions$);

    expect(submissionService.getUserSubmissions).not.toHaveBeenCalled();
  });
});
