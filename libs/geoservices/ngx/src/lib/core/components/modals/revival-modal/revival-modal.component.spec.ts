import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevivalModalComponent } from './revival-modal.component';

describe('RevivalModalComponent', () => {
  let component: RevivalModalComponent;
  let fixture: ComponentFixture<RevivalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevivalModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RevivalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
