import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrapiComponent } from './strapi.component';

describe('StrapiComponent', () => {
  let component: StrapiComponent;
  let fixture: ComponentFixture<StrapiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrapiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrapiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
