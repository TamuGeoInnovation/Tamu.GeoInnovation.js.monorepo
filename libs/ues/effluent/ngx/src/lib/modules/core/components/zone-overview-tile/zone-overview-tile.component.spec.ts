import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneOverviewTileComponent } from './zone-overview-tile.component';

describe('ZoneOverviewTileComponent', () => {
  let component: ZoneOverviewTileComponent;
  let fixture: ComponentFixture<ZoneOverviewTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZoneOverviewTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoneOverviewTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
