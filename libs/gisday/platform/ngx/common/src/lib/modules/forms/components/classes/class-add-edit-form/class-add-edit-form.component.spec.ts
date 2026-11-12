import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Class } from '@tamu-gisc/gisday/platform/data-api';
import { ClassService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { ClassAddEditFormComponent, sectionsFrom } from './class-add-edit-form.component';

/**
 * #2872. The same class is often added once per section, so Create Class takes a list of sections and adds one class
 * for each.
 */
describe('ClassAddEditFormComponent, creating', () => {
  function create(refuse: Array<string> = []) {
    const created: Array<Partial<Class>> = [];
    const toast = jest.fn();
    const navigate = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: Router, useValue: { navigate } },
        {
          provide: ClassService,
          useValue: {
            getEntity: () => of({}),
            createEntity: (c: Partial<Class>) => {
              if (refuse.includes(c.section)) {
                return throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Class already exists' } }));
              }
              created.push(c);
              return of(c);
            }
          }
        },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 'season' }) } },
        { provide: NotificationService, useValue: { toast } }
      ]
    });

    const fixture = TestBed.createComponent(ClassAddEditFormComponent);
    fixture.componentRef.setInput('type', 'create');
    fixture.detectChanges();

    const submit = (section: string) => {
      fixture.componentInstance.form.patchValue({ code: 'GEOG', number: '476', title: 'GIS', professorName: 'Goldberg', section });
      fixture.componentInstance.handleSubmission();
      fixture.detectChanges();
    };

    return { fixture, created, toast, navigate, submit };
  }

  it('adds one class for each section in a list', () => {
    const { created, navigate, submit } = create();

    submit('501, 502, 503');

    expect(created.map((c) => c.section)).toEqual(['501', '502', '503']);
    expect(created.every((c) => c.code === 'GEOG' && c.number === '476' && c.season === 'season')).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/admin/classes']);
  });

  it('adds a single section as one class, as before', () => {
    const { created, submit } = create();

    submit('501');

    expect(created.map((c) => c.section)).toEqual(['501']);
  });

  it('says which sections were not added, keeps them in the form, and stays on the page', () => {
    const { fixture, created, toast, navigate, submit } = create(['502']);

    submit('501, 502, 503');

    expect(created.map((c) => c.section)).toEqual(['501', '503']);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/502.*Class already exists/) }));
    expect(fixture.componentInstance.form.get('section').value).toBe('502');
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('sectionsFrom', () => {
  it.each([
    ['501', ['501']],
    ['501, 502,503', ['501', '502', '503']],
    ['501; 502  503\n504', ['501', '502', '503', '504']],
    [' 501, 501 ', ['501']],
    ['', []],
    [null, []]
  ])('reads "%s" as %j', (text, sections) => {
    expect(sectionsFrom(text)).toEqual(sections);
  });
});
