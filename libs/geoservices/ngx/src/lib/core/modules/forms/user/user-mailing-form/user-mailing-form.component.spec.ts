import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMailingFormComponent } from './user-mailing-form.component';

describe('UserMailingFormComponent', () => {
  let component: UserMailingFormComponent;
  let fixture: ComponentFixture<UserMailingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserMailingFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMailingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
