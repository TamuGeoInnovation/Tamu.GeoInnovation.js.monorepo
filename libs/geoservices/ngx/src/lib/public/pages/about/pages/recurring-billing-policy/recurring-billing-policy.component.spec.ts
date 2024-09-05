import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringBillingPolicyComponent } from './recurring-billing-policy.component';

describe('RecurringBillingPolicyComponent', () => {
  let component: RecurringBillingPolicyComponent;
  let fixture: ComponentFixture<RecurringBillingPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecurringBillingPolicyComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringBillingPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
