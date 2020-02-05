import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefillComponent } from './refill.component';

describe('RefillComponent', () => {
  let component: RefillComponent;
  let fixture: ComponentFixture<RefillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
