import { async, TestBed } from '@angular/core/testing';
import { UITileNavigationModule } from './ui-kits-ngx-navigation-mobile-tile.module';

describe('UITileNavigationModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UITileNavigationModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UITileNavigationModule).toBeDefined();
  });
});
