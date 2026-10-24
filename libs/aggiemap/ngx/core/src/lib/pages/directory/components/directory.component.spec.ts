import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { DirectoryComponent } from './directory.component';

describe('DirectoryComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DirectoryComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    http = TestBed.inject(HttpTestingController);
  });

  /** The cells of the first row the table draws, by column name. */
  const firstRow = async () => {
    const fixture = TestBed.createComponent(DirectoryComponent);
    fixture.detectChanges();

    http.expectOne('/assets/data/building-directory.json').flush([
      { Bldg: '0518', BldgName: 'Zachry Engineering Education Complex', BldgAbbr: 'ZACH' }
    ]);

    // The rows follow the search box, which waits 300 ms after typing.
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const names = Array.from(fixture.nativeElement.querySelectorAll('.datatable-header-cell'), (c: HTMLElement) => c.textContent.trim());
    const cells = Array.from(fixture.nativeElement.querySelectorAll('datatable-body-row')[0].querySelectorAll('.datatable-body-cell'), (c: HTMLElement) =>
      c.textContent.trim()
    );

    return Object.fromEntries(names.map((name, i) => [name, cells[i]]));
  };

  afterEach(() => http.verify());

  // The column read `BldgAbbrev`, which the directory's data does not have, so every building's abbreviation was blank (#2262).
  it("shows each building's abbreviation", async () => {
    expect(await firstRow()).toEqual({ Name: 'Zachry Engineering Education Complex', Number: '0518', Abbreviation: 'ZACH' });
  });
});
