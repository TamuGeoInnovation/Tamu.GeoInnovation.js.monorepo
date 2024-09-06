import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSecurityPolicyComponent } from './data-security-policy.component';

describe('DataSecurityPolicyComponent', () => {
  let component: DataSecurityPolicyComponent;
  let fixture: ComponentFixture<DataSecurityPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataSecurityPolicyComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSecurityPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
