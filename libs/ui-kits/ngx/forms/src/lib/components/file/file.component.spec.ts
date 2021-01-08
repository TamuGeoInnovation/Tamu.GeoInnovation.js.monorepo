import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileComponent } from './file.component';

describe('FileComponent', () => {
  let component: FileComponent;
  let fixture: ComponentFixture<FileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FileComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should correctly evaluate checked', () => {
    expect(component.checked).toBeFalsy();
  });
  it('should correctly evaluate writeValue', () => {
    component.writeValue(true);
    expect(component.checked).toBeTruthy();
  });
  it('should correctly evaluate setDisabledState', () => {
    component.setDisabledState(true);
    expect(component.checked).toBeTruthy();
  });
});
