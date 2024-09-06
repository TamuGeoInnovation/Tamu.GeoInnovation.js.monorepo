import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarTabComponent } from './tab.component';

describe('SidebarTabComponent', () => {
  let component: SidebarTabComponent;
  let fixture: ComponentFixture<SidebarTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarTabComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should respond to click events', (done) => {
    const mouseEvent: MouseEvent = { altKey: 10 } as unknown as MouseEvent;
    component.$clicked.subscribe((event) => {
      expect(event).toEqual({
        event: mouseEvent,
        native: component
      });
      done();
    });
    (component as unknown as { clicked: (MouseEvent) => unknown }).clicked(mouseEvent);
  });
});
