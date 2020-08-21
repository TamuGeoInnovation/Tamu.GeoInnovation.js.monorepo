import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClientMetadataComponent } from './view-client-metadata.component';

describe('ViewClientMetadataComponent', () => {
  let component: ViewClientMetadataComponent;
  let fixture: ComponentFixture<ViewClientMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewClientMetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewClientMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
