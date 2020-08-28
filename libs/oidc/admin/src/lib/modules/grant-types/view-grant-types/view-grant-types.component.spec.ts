import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGrantTypesComponent } from './view-grant-types.component';

describe('ViewGrantTypesComponent', () => {
  let component: ViewGrantTypesComponent;
  let fixture: ComponentFixture<ViewGrantTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewGrantTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewGrantTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
