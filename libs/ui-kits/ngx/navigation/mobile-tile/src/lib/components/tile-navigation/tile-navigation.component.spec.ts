import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { TileNavigationComponent } from './tile-navigation.component';
import { TileSubmenuContainerComponent } from '../tile-submenu-container/tile-submenu-container.component';
import { TileService } from '../../services/tile.service';

describe('TileNavigationComponent', () => {
  let component: TileNavigationComponent;
  let fixture: ComponentFixture<TileNavigationComponent>;
  let TileServiceStub: Partial<TileService>;
  TileServiceStub = {
    activeSubMenu: new BehaviorSubject({ template: undefined, title: 'yeet' }),
    menuActive: new BehaviorSubject(false),
    toggleMenu(state?: boolean) {
      this.menuActive.next(state !== undefined ? state : !this.menuActive.getValue());
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TileNavigationComponent, TileSubmenuContainerComponent],
      providers: [{ provide: TileService, useValue: TileServiceStub }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileNavigationComponent);
    component = fixture.componentInstance;
    TileServiceStub = TestBed.get(TileService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly evaluate ngOnInit for toggle == undefined', () => {
    spyOn(console, 'warn');
    component.toggle = undefined;
    component.ngOnInit();
    expect(console.warn).toHaveBeenCalled();
  });
  it('should correctly evaluate ngOnInit for toggle == defined', () => {
    const yeet = spyOn(component, 'switchState');
    component.toggle = of(true);
    component.ngOnInit();
    expect(yeet).toHaveBeenCalled();
  });

  it('should correctly evaluate switchState', () => {
    const yeet = spyOn(TileServiceStub, 'toggleMenu');
    component.switchState(false);
    expect(yeet).toBeTruthy();
  });
});
