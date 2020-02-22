import { async, TestBed } from '@angular/core/testing';
import { UiKitsNgxNavigationMobileTileModule } from './ui-kits-ngx-navigation-mobile-tile.module';

describe('UiKitsNgxNavigationMobileTileModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UiKitsNgxNavigationMobileTileModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UiKitsNgxNavigationMobileTileModule).toBeDefined();
  });
});
