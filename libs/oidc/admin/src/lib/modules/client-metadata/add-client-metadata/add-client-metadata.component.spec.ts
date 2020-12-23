import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { AddClientMetadataComponent } from './add-client-metadata.component';

describe('AddClientMetadataComponent', () => {
  let component: AddClientMetadataComponent;
  let fixture: ComponentFixture<AddClientMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UIFormsModule, ReactiveFormsModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [AddClientMetadataComponent],
      providers: [
        {
          provide: env,
          useValue: { api_url: 'https://' }
        }
      ]
    }).compileComponents();
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
