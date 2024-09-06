import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintResourceComponent } from './print-resource.component';

describe('PrintResourceComponent', () => {
  let component: PrintResourceComponent;
  let fixture: ComponentFixture<PrintResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrintResourceComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
