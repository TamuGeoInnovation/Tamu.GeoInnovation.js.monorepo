import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientMetadataComponent } from './add-client-metadata.component';

describe('AddClientMetadataComponent', () => {
  let component: AddClientMetadataComponent;
  let fixture: ComponentFixture<AddClientMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddClientMetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClientMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
