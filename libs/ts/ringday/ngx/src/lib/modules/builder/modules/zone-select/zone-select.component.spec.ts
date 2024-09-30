import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneSelectComponent } from './zone-select.component';

describe('ZoneSelectComponent', () => {
  let component: ZoneSelectComponent;
  let fixture: ComponentFixture<ZoneSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZoneSelectComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoneSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
