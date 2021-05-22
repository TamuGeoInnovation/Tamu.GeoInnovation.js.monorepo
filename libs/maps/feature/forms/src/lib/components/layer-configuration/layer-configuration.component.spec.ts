import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { LayerConfigurationComponent } from './layer-configuration.component';

describe('LayerConfigurationComponent', () => {
  let component: LayerConfigurationComponent;
  let fixture: ComponentFixture<LayerConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, UIFormsModule],
      declarations: [LayerConfigurationComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
