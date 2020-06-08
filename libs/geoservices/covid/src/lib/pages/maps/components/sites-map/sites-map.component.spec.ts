import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitesMapComponent } from './sites-map.component';

describe('SitesMapComponent', () => {
  let component: SitesMapComponent;
  let fixture: ComponentFixture<SitesMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SitesMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitesMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
