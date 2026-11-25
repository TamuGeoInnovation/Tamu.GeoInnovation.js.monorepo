import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { MainMobileSidebarComponent } from './main-mobile-sidebar.component';

/**
 * The phone menu offers Directions (#3149). The trip planner has had its own phone panels and its own address,
 * /map/m/trip, but nothing on a phone linked to it: the only way in was Directions To Here in a feature's popup. The
 * desktop sidebar has always had a Directions tab. It sits with Bus Routes, the menu's other way of getting about.
 */
describe('MainMobileSidebarComponent', () => {
  function menu() {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Angulartics2, useValue: { eventTrack: new Subject() } }]
    }).overrideTemplate(MainMobileSidebarComponent, '');

    return TestBed.createComponent(MainMobileSidebarComponent).componentInstance.menu;
  }

  it("offers Directions, opening the phone's own trip planner", () => {
    expect(menu()).toContainEqual(expect.objectContaining({ name: 'Directions', type: 'router-path', path: '/map/m/trip' }));
  });

  it('lists it with Bus Routes, before the pages that are not the map', () => {
    const names = menu().map((item) => item.name);

    expect(names.indexOf('Directions')).toBe(names.indexOf('Bus Routes') + 1);
  });
});
