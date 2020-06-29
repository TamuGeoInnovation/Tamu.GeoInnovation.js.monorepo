import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileSubmenuContainerComponent } from './tile-submenu-container.component';

describe('TileSubmenuContainerComponent', () => {
  let component: TileSubmenuContainerComponent;
  let fixture: ComponentFixture<TileSubmenuContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileSubmenuContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileSubmenuContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
