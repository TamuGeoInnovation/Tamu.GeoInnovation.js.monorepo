import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMobileSidebarComponent } from './main-mobile-sidebar.component';

describe('MainMobileSidebarComponent', () => {
  let component: MainMobileSidebarComponent;
  let fixture: ComponentFixture<MainMobileSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MainMobileSidebarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMobileSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
