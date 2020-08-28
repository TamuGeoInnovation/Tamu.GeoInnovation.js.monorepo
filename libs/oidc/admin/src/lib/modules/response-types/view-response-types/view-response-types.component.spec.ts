import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewResponseTypesComponent } from './view-response-types.component';

describe('ViewResponseTypesComponent', () => {
  let component: ViewResponseTypesComponent;
  let fixture: ComponentFixture<ViewResponseTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewResponseTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewResponseTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
