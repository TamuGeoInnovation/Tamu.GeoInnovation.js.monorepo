import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInOutSidebarComponent } from './sidebar.component';

describe('MoveInOutSidebarComponent', () => {
  let component: MoveInOutSidebarComponent;
  let fixture: ComponentFixture<MoveInOutSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MoveInOutSidebarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInOutSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
