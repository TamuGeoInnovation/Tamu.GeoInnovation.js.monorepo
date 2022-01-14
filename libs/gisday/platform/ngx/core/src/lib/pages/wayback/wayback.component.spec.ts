import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaybackComponent } from './wayback.component';

describe('WaybackComponent', () => {
  let component: WaybackComponent;
  let fixture: ComponentFixture<WaybackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaybackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaybackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
