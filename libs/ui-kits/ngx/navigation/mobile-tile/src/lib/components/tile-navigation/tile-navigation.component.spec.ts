import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TileNavigationComponent } from './tile-navigation.component';
import { TileSubmenuContainerComponent } from '../tile-submenu-container/tile-submenu-container.component';

describe('TileNavigationComponent', () => {
  let component: TileNavigationComponent;
  let fixture: ComponentFixture<TileNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TileNavigationComponent, TileSubmenuContainerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
