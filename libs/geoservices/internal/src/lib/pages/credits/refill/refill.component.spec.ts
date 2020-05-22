import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefillComponent } from './refill.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('RefillComponent', () => {
  let component: RefillComponent;
  let fixture: ComponentFixture<RefillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
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
