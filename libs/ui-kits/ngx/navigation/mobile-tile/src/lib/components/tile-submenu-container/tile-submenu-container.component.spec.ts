import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TileSubmenuContainerComponent } from './tile-submenu-container.component';

describe('TileSubmenuContainerComponent', () => {
  let component: TileSubmenuContainerComponent;
  let fixture: ComponentFixture<TileSubmenuContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      declarations: [TileSubmenuContainerComponent]
    }).compileComponents();
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
