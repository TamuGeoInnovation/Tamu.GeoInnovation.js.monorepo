import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceLinkFormComponent } from './place-link-form.component';

describe('PlaceLinkFormComponent', () => {
  let component: PlaceLinkFormComponent;
  let fixture: ComponentFixture<PlaceLinkFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlaceLinkFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceLinkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
