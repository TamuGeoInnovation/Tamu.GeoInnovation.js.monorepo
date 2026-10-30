import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AssetsService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { SpeakerCardComponent } from './speaker-card.component';

/**
 * #2568. The Presenters page's card drew the class banner over the blank person icon for a presenter with a school
 * and a year but no photo. The banner belongs on a photo only.
 */
describe('SpeakerCardComponent: the class banner', () => {
  const speaker = (photoPath?: string) => ({
    guid: 's-1',
    firstName: 'Luke',
    lastName: 'Smith',
    graduationYear: '2013',
    university: { acronym: 'UTT', hexTriplet: 'f15a22' },
    images: photoPath ? [{ path: photoPath }] : []
  });

  function render(photoPath?: string) {
    TestBed.configureTestingModule({
      imports: [SpeakerCardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AssetsService, useValue: { getAssetUrl: (path: string) => of(`assets/uploads/${path}`) } }
      ]
    });

    const fixture = TestBed.createComponent(SpeakerCardComponent);
    fixture.componentRef.setInput('speaker', speaker(photoPath));
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    const banner = () => (fixture.nativeElement as HTMLElement).querySelector('.class-banner')?.textContent.trim() ?? null;

    return { fixture, http, banner };
  }

  it('is not drawn when the presenter has no photo', () => {
    const { banner } = render();

    expect(banner()).toBeNull();
  });

  it('is drawn over the presenter photo once it is found', () => {
    const { fixture, http, banner } = render('images/speakers/luke.jpg');

    http.expectOne('assets/uploads/images/speakers/luke.jpg').flush('');
    fixture.detectChanges();

    expect(banner()).toBe("UTT '13");
  });

  it('is not drawn when the presenter photo is missing', () => {
    const { fixture, http, banner } = render('images/speakers/gone.jpg');

    http.expectOne('assets/uploads/images/speakers/gone.jpg').flush('', { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(banner()).toBeNull();
  });
});
