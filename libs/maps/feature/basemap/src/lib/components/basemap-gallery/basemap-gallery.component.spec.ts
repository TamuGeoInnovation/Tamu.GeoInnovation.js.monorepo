import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasemapGalleryComponent } from './basemap-gallery.component';

describe('BasemapGalleryComponent', () => {
  let component: BasemapGalleryComponent;
  let fixture: ComponentFixture<BasemapGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BasemapGalleryComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasemapGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
