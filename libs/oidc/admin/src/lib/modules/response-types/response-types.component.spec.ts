import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseTypesComponent } from './response-types.component';

describe('ResponseTypesComponent', () => {
  let component: ResponseTypesComponent;
  let fixture: ComponentFixture<ResponseTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponseTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponseTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
