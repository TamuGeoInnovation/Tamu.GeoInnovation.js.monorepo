import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileNavigationComponent } from './tile-navigation.component';

describe('TileNavigationComponent', () => {
  let component: TileNavigationComponent;
  let fixture: ComponentFixture<TileNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileNavigationComponent ]
    })
    .compileComponents();
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
