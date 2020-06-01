import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { UploadFileComponent } from './upload-file.component';

describe('UploadFileComponent', () => {
  let component: UploadFileComponent;
  let fixture: ComponentFixture<UploadFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UIFormsModule, ReactiveFormsModule, CommonModule, FormsModule, UILayoutModule],
      declarations: [UploadFileComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
