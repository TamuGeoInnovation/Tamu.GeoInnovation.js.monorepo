import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurbCutsComponent } from './curb-cuts.component';

describe('CurbCutsComponent', () => {
  let component: CurbCutsComponent;
  let fixture: ComponentFixture<CurbCutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurbCutsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurbCutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
