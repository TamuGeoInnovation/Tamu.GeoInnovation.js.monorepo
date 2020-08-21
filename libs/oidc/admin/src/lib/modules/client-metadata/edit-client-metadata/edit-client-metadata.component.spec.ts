import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditClientMetadataComponent } from './edit-client-metadata.component';

describe('EditClientMetadataComponent', () => {
  let component: EditClientMetadataComponent;
  let fixture: ComponentFixture<EditClientMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditClientMetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditClientMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
