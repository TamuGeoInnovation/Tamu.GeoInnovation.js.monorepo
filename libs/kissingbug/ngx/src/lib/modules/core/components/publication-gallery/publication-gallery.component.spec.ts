import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationGalleryComponent } from './publication-gallery.component';

describe('PublicationGalleryComponent', () => {
  let component: PublicationGalleryComponent;
  let fixture: ComponentFixture<PublicationGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicationGalleryComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicationGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
