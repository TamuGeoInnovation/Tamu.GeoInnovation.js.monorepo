import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviorSubject } from 'rxjs';

import { TileSubmenuComponent } from './tile-submenu.component';
import { TileService } from '../../services/tile.service';

describe('TileSubmenuComponent', () => {
  let component: TileSubmenuComponent;
  let fixture: ComponentFixture<TileSubmenuComponent>;
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
      declarations: [TileSubmenuComponent],
      providers: [{ provide: TileService, useValue: TileServiceStub }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileSubmenuComponent);
    component = fixture.componentInstance;
    TileServiceStub = TestBed.get(TileService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    const yeet = spyOn(TileServiceStub, 'toggleSubmenu');
    component.close();
    expect(yeet).toBeCalled();
  });
});
