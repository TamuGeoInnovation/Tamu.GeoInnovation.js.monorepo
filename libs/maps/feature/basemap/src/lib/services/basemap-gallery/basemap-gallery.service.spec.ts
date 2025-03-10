import { TestBed } from '@angular/core/testing';

import { BasemapGalleryService } from './basemap-gallery.service';

describe('BasemapGalleryService', () => {
  let service: BasemapGalleryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BasemapGalleryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
