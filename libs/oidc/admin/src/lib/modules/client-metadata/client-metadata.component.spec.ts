import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ClientMetadataComponent } from './client-metadata.component';

describe('ClientMetadataComponent', () => {
  let component: ClientMetadataComponent;
  let fixture: ComponentFixture<ClientMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ClientMetadataComponent]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ClientMetadataComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
