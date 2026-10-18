import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

import { PresenterCardComponent } from './presenter-card.component';

describe('PresenterCardComponent', () => {
  const render = (speaker: Partial<Speaker>) => {
    TestBed.configureTestingModule({
      imports: [PresenterCardComponent],
      providers: [provideRouter([]), { provide: EnvironmentService, useValue: { value: () => '' } }]
    });

    const fixture = TestBed.createComponent(PresenterCardComponent);
    fixture.componentRef.setInput('speaker', { guid: 'speaker-1', images: [], ...speaker });
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    return {
      name: element.querySelector('.name')?.textContent?.replace(/\s+/g, ' ').trim(),
      organization: element.querySelector('.organization')?.textContent?.trim()
    };
  };

  it("writes a Texas A&M former student's class year after their name, and their company under it", () => {
    const card = render({
      firstName: 'Benjamin',
      lastName: 'Lybrand',
      university: { acronym: 'TAMU' } as Speaker['university'],
      graduationYear: '2014',
      organization: { name: 'ConocoPhillips' } as Speaker['organization']
    });

    expect(card.name).toBe("Benjamin Lybrand '14");
    expect(card.organization).toBe('ConocoPhillips');
  });

  it('adds no year for a graduate of another university', () => {
    const card = render({
      firstName: 'Ann',
      lastName: 'Example',
      university: { acronym: 'LSU' } as Speaker['university'],
      graduationYear: '2022'
    });

    expect(card.name).toBe('Ann Example');
  });

  it('shows the free-text affiliation when there is no organization, and no empty line when there is neither', () => {
    expect(render({ firstName: 'A', lastName: 'B', affiliation: 'Lenovo' }).organization).toBe('Lenovo');
    TestBed.resetTestingModule();
    expect(render({ firstName: 'A', lastName: 'B' }).organization).toBeUndefined();
  });
});
