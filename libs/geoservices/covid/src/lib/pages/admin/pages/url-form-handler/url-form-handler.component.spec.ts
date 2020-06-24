import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlFormHandlerComponent } from './url-form-handler.component';

describe('UrlFormHandlerComponent', () => {
  let component: UrlFormHandlerComponent;
  let fixture: ComponentFixture<UrlFormHandlerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrlFormHandlerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlFormHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
