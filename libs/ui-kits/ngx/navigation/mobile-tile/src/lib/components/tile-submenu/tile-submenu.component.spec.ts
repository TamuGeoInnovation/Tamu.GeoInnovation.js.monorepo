import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileSubmenuComponent } from './tile-submenu.component';

describe('TileSubmenuComponent', () => {
  let component: TileSubmenuComponent;
  let fixture: ComponentFixture<TileSubmenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileSubmenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileSubmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
