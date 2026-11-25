import type { Mock } from 'vitest';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { UserListComponent } from './user-list.component';

const user = (name: string, email: string, id: string) => ({ user_info: { name, email, id } });

/**
 * #2574: Admin > Users answered 500 once the tenant passed Auth0's 1,000-user limit. It now lists the first 1,000, says
 * when there are more, and searches every user through the API, in the shared admin search box (#2914).
 */
describe('UserListComponent', () => {
  let getUsers: Mock;

  function open() {
    TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [{ provide: UserService, useValue: { getUsers } }]
    });

    const fixture = TestBed.createComponent(UserListComponent);
    fixture.detectChanges();

    return fixture;
  }

  const text = (fixture: ReturnType<typeof open>) => (fixture.nativeElement as HTMLElement).textContent.replace(/\s+/g, ' ');

  beforeEach(() => {
    getUsers = vi.fn((q?: string) =>
      of(
        q
          ? { users: [user('Zoe Past', 'zoe@example.edu', 'auth0|1500')], truncated: false }
          : { users: [user('Ana Lee', 'ana@example.edu', 'auth0|1')], truncated: true }
      )
    );
  });

  it('lists the first 1,000 and says so, and to search, when Auth0 has more', fakeAsync(() => {
    const fixture = open();
    tick(400);
    fixture.detectChanges();

    expect(getUsers).toHaveBeenCalledWith(undefined);
    expect(text(fixture)).toContain('Showing the first 1,000 users. Search by name or email to find anyone else.');
    expect(text(fixture)).toContain('ana@example.edu');
  }));

  it('asks the API for a search, which finds a user past the first 1,000', fakeAsync(() => {
    const fixture = open();
    tick(400);

    fixture.componentInstance.search.setValue('  zoe ');
    tick(400);
    fixture.detectChanges();

    expect(getUsers).toHaveBeenLastCalledWith('zoe');
    expect(text(fixture)).toContain('zoe@example.edu');
    expect(text(fixture)).not.toContain('Showing the first 1,000 users');
  }));

  // #3116: Auth0 needs 3 characters for a wildcard search; "zh" went to the API, was refused, and the page spun for ever.
  it('asks for 3 letters before searching, and sends nothing shorter', fakeAsync(() => {
    const fixture = open();
    tick(400);
    getUsers.mockClear();

    fixture.componentInstance.search.setValue('zh');
    tick(400);
    fixture.detectChanges();

    expect(getUsers).not.toHaveBeenCalled();
    expect(text(fixture)).toContain('Type at least 3 letters of a name or email to search.');
    expect((fixture.nativeElement as HTMLElement).querySelector('.loader')).toBeNull();
  }));

  it('says why a search was refused, instead of spinning', fakeAsync(() => {
    const fixture = open();
    tick(400);
    getUsers.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 400, error: { statusCode: 400, message: 'The search was not valid.' } })
      )
    );

    fixture.componentInstance.search.setValue('zhang');
    tick(400);
    fixture.detectChanges();

    expect(text(fixture)).toContain('The search was not valid.');
    expect((fixture.nativeElement as HTMLElement).querySelector('.loader')).toBeNull();
  }));

  it('says when no user matches', fakeAsync(() => {
    getUsers.mockReturnValue(of({ users: [], truncated: false }));
    const fixture = open();

    fixture.componentInstance.search.setValue('nobody');
    tick(400);
    fixture.detectChanges();

    expect(text(fixture)).toContain('No users match "nobody".');
  }));
});
