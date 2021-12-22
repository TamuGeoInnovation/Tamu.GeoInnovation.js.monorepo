import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortraitGalleryComponent } from './portrait-gallery.component';

describe('PortraitGalleryComponent', () => {
  let component: PortraitGalleryComponent;
  let fixture: ComponentFixture<PortraitGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortraitGalleryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortraitGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
