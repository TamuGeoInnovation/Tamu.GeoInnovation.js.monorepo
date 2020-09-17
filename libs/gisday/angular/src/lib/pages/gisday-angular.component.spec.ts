import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GISDayAngularComponent } from './gisday-angular.component';

describe('GISDayAngularComponent', () => {
  let component: GISDayAngularComponent;
  let fixture: ComponentFixture<GISDayAngularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GISDayAngularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GISDayAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
