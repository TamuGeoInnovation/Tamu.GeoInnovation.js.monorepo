import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientMetadataComponent } from './client-metadata.component';

describe('ClientMetadataComponent', () => {
  let component: ClientMetadataComponent;
  let fixture: ComponentFixture<ClientMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientMetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
