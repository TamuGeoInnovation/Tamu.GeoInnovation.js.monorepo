import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentersViewComponent } from './presenters-view.component';

describe('PresentersViewComponent', () => {
  let component: PresentersViewComponent;
  let fixture: ComponentFixture<PresentersViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresentersViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresentersViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
