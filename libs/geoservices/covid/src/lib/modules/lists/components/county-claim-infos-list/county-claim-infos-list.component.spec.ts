import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountyClaimInfosListComponent } from './county-claim-infos-list.component';

describe('CountyClaimInfosListComponent', () => {
  let component: CountyClaimInfosListComponent;
  let fixture: ComponentFixture<CountyClaimInfosListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountyClaimInfosListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountyClaimInfosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
