import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAccessTokenComponent } from './view-access-token.component';

describe('ViewAccessTokenComponent', () => {
  let component: ViewAccessTokenComponent;
  let fixture: ComponentFixture<ViewAccessTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAccessTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAccessTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
