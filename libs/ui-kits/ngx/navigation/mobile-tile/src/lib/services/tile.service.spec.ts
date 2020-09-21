import { async, TestBed } from '@angular/core/testing';
import { TileService } from './tile.service';

describe('TileService', () => {
  let service: TileService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({});
    service = new TileService();
  }));

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should toggleMenu: True to false', () => {
    service.toggleMenu();
    expect(service.menuActive.value).toBeTruthy();
    service.toggleMenu();
    expect(service.menuActive.value).toBeFalsy();
  });

  it('should toggleSubmenu: True to false', () => {
    service.toggleSubmenu();
    expect(service.submenuActive.value).toBeTruthy();
    service.toggleSubmenu();
    expect(service.submenuActive.value).toBeFalsy();
  });

  it('should toggleSubmenu: False to stay false', () => {
    service.toggleSubmenu(false);
    expect(service.submenuActive.value).toBeFalsy();
    service.toggleMenu(false);
    expect(service.submenuActive.value).toBeFalsy();
  });

  it('should updateSubmenu', () => {
    const testInterface = { template: undefined, title: 'yeet' };
    service.updateSubmenu(testInterface);
    expect(service.activeSubMenu.getValue()).toStrictEqual({ template: undefined, title: 'yeet' });
  });
});
