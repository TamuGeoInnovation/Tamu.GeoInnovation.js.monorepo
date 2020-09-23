import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentersComponent } from './presenters.component';

describe('PresentersComponent', () => {
  let component: PresentersComponent;
  let fixture: ComponentFixture<PresentersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresentersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresentersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
