import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

import { MainMobileSidebarComponent } from './main-mobile-sidebar.component';

describe('MainMobileSidebarComponent', () => {
  let component: MainMobileSidebarComponent;
  let fixture: ComponentFixture<MainMobileSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UITamuBrandingModule, RouterTestingModule],
      declarations: [MainMobileSidebarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMobileSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
