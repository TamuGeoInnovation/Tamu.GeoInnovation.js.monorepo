import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountyClaimInfoDetailsComponent } from './county-claim-info-details.component';

describe('CountyClaimInfoDetailsComponent', () => {
  let component: CountyClaimInfoDetailsComponent;
  let fixture: ComponentFixture<CountyClaimInfoDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountyClaimInfoDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountyClaimInfoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
