import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalHostComponent } from './modal-host.component';

describe('ModalHostComponent', () => {
  let component: ModalHostComponent;
  let fixture: ComponentFixture<ModalHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalHostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
