import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountyClaimComponent } from './county-claim.component';

describe('CountyClaimComponent', () => {
  let component: CountyClaimComponent;
  let fixture: ComponentFixture<CountyClaimComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountyClaimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountyClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
