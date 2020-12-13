import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailClientMetadataComponent } from './detail-client-metadata.component';

describe('DetailClientMetadataComponent', () => {
  let component: DetailClientMetadataComponent;
  let fixture: ComponentFixture<DetailClientMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DetailClientMetadataComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailClientMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
