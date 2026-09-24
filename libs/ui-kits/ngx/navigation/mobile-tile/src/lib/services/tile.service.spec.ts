import { TileService } from './tile.service';

/**
 * Constructed directly rather than through `TestBed`. The service has no injected dependencies, so
 * a testing module adds nothing -- the previous version configured an empty one and then ignored it,
 * building the service with `new` anyway.
 */
describe('TileService', () => {
  let service: TileService;

  beforeEach(() => {
    service = new TileService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('.toggleMenu()', () => {
    it('starts closed and flips on each call', () => {
      expect(service.menuActive.value).toBe(false);

      service.toggleMenu();
      expect(service.menuActive.value).toBe(true);

      service.toggleMenu();
      expect(service.menuActive.value).toBe(false);
    });

    it('uses an explicit state instead of flipping when one is given', () => {
      service.toggleMenu(false);
      expect(service.menuActive.value).toBe(false);

      service.toggleMenu(true);
      service.toggleMenu(true);
      expect(service.menuActive.value).toBe(true);
    });
  });

  describe('.toggleSubmenu()', () => {
    it('starts closed and flips on each call', () => {
      expect(service.submenuActive.value).toBe(false);

      service.toggleSubmenu();
      expect(service.submenuActive.value).toBe(true);

      service.toggleSubmenu();
      expect(service.submenuActive.value).toBe(false);
    });

    it('uses an explicit state instead of flipping when one is given', () => {
      service.toggleSubmenu(false);
      service.toggleSubmenu(false);
      expect(service.submenuActive.value).toBe(false);
    });
  });

  /**
   * The previous version of this file toggled the *menu* and then asserted on the *submenu*, which
   * was already false -- so it passed without testing anything and would have kept passing if
   * `toggleMenu` stopped working. The two states are genuinely independent, which is what that
   * assertion was reaching for, so it is covered explicitly here.
   */
  it('keeps the menu and submenu states independent', () => {
    service.toggleMenu(true);

    expect(service.menuActive.value).toBe(true);
    expect(service.submenuActive.value).toBe(false);

    service.toggleSubmenu(true);
    service.toggleMenu(false);

    expect(service.menuActive.value).toBe(false);
    expect(service.submenuActive.value).toBe(true);
  });

  describe('.updateSubmenu()', () => {
    it('publishes the submenu to subscribers', () => {
      const submenu = { template: undefined, title: 'yeet' };

      service.updateSubmenu(submenu);

      expect(service.activeSubMenu.getValue()).toStrictEqual(submenu);
    });

    // Consumers subscribe to render the sub-menu, so the stream has to emit rather than only hold
    // the latest value.
    it('emits to an existing subscriber', () => {
      const seen: Array<unknown> = [];
      service.activeSubMenu.subscribe((v) => seen.push(v));

      service.updateSubmenu({ template: undefined, title: 'first' });
      service.updateSubmenu({ template: undefined, title: 'second' });

      expect(seen).toEqual([
        undefined,
        { template: undefined, title: 'first' },
        { template: undefined, title: 'second' }
      ]);
    });
  });
});
