import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailResponseTypeComponent } from './detail-response-type.component';

describe('DetailResponseTypeComponent', () => {
  let component: DetailResponseTypeComponent;
  let fixture: ComponentFixture<DetailResponseTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailResponseTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailResponseTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
