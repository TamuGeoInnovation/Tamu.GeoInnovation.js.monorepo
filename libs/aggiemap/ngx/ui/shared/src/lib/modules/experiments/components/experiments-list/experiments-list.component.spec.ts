import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

import { BasemapOverrideComponent } from '../basemap-override/basemap-override.component';
import { ExperimentsListComponent } from './experiments-list.component';

describe('ExperimentsListComponent', () => {
  // The back arrow called a method the component did not have, so it did nothing (#1909).
  it('goes back to the sidebar from its back arrow, as the other sidebar pages do', () => {
    const route = {};
    const navigate = jest.fn();

    TestBed.configureTestingModule({
      imports: [ExperimentsListComponent],
      providers: [
        { provide: ResponsiveService, useValue: { isMobile: of(true) } },
        { provide: Router, useValue: { navigate } },
        { provide: ActivatedRoute, useValue: route }
      ]
    }).overrideComponent(ExperimentsListComponent, {
      remove: { imports: [BasemapOverrideComponent] },
      add: { schemas: [NO_ERRORS_SCHEMA] }
    });

    const fixture = TestBed.createComponent(ExperimentsListComponent);
    fixture.detectChanges();

    const back: HTMLElement = fixture.nativeElement.querySelector('.sidebar-component-name .material-icons');
    expect(back?.textContent).toBe('arrow_back');

    back.click();

    expect(navigate).toHaveBeenCalledWith(['../'], { relativeTo: route });
  });
});
