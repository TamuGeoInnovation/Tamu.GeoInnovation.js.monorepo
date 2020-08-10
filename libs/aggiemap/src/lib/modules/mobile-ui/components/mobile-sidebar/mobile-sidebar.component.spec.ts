import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileSidebarComponent } from './mobile-sidebar.component';

describe('MobileSidebarComponent', () => {
  let component: MobileSidebarComponent;
  let fixture: ComponentFixture<MobileSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
