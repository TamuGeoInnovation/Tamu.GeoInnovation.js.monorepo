import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiVersionFragmentComponent } from './api-version-fragment.component';

describe('ApiVersionFragmentComponent', () => {
  let component: ApiVersionFragmentComponent;
  let fixture: ComponentFixture<ApiVersionFragmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApiVersionFragmentComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiVersionFragmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
