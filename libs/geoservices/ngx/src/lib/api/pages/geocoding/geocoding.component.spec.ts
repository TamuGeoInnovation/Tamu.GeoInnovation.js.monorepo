import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HighlightPlusModule } from 'ngx-highlightjs/plus';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { UIScrollToModule } from '@tamu-gisc/ui-kits/ngx/interactions/scroll-to';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { GeocodingComponent } from './geocoding.component';
import { ApiComponentsModule } from '../../components/components.module';

describe('GeocodingComponent', () => {
  let component: GeocodingComponent;
  let fixture: ComponentFixture<GeocodingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UIClipboardModule,
        UIScrollToModule,
        UILayoutModule,
        HighlightPlusModule,
        RouterTestingModule,
        ApiComponentsModule
      ],
      declarations: [GeocodingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeocodingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
