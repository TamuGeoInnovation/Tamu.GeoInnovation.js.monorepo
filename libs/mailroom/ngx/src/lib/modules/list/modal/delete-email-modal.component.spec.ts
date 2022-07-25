import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEmailModalComponent } from './delete-email-modal.component';

describe('DeleteEmailModalComponent', () => {
  let component: DeleteEmailModalComponent;
  let fixture: ComponentFixture<DeleteEmailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteEmailModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteEmailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
