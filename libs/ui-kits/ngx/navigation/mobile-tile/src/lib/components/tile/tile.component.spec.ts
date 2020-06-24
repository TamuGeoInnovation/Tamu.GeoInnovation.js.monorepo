import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviorSubject } from 'rxjs';

import { TileComponent } from './tile.component';
import { TileTitleComponent } from '../tile-title/tile-title.component';
import { TileSubmenuDirective } from '../../directives/tile-submenu.directive';
import { TileService } from '../../services/tile.service';

describe('TileComponent', () => {
  let component: TileComponent;
  let fixture: ComponentFixture<TileComponent>;
  let TileServiceStub: Partial<TileService>;
  TileServiceStub = {
    activeSubMenu: new BehaviorSubject({ template: undefined, title: 'yeet' }),
    submenuActive: new BehaviorSubject(false),
    toggleSubmenu(state?: boolean) {
      this.submenuActive.next(state !== undefined ? state : !this.submenuActive.getValue());
    }
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TileComponent, TileTitleComponent, TileSubmenuDirective],
      providers: [{ provide: TileService, useValue: TileServiceStub }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileComponent);
    component = fixture.componentInstance;
    TileServiceStub = TestBed.get(TileService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
