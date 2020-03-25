import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFormInputComponent } from './upload-form-input.component';

describe('UploadFormInputComponent', () => {
  let component: UploadFormInputComponent;
  let fixture: ComponentFixture<UploadFormInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadFormInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFormInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
