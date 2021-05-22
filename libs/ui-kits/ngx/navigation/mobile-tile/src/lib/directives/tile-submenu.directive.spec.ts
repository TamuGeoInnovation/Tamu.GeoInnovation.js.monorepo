import { Component, ViewChild, TemplateRef } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { TileSubmenuDirective } from './tile-submenu.directive';

@Component({
  template: ` <div giscTileSubmenu></div> `
})
class MockTileSubmenuDirectiveComponent {
  @ViewChild(TileSubmenuDirective, { static: true })
  public directive: TileSubmenuDirective;
}

describe('TileSubmenuDirective', () => {
  let fixture: ComponentFixture<MockTileSubmenuDirectiveComponent>;
  let component: MockTileSubmenuDirectiveComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [TemplateRef],
      declarations: [TileSubmenuDirective, MockTileSubmenuDirectiveComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MockTileSubmenuDirectiveComponent);
    component = fixture.componentInstance;
  });

  it('should create an instance', () => {
    component.directive.ngOnInit();
    expect(component.directive).toBeDefined();
  });
});
