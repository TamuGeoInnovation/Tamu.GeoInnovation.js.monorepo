import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AggiemapCoreUIModule } from '../../../core-ui/core-ui.module';

import { MobileSidebarComponent } from './mobile-sidebar.component';

describe('MobileSidebarComponent', () => {
  let component: MobileSidebarComponent;
  let fixture: ComponentFixture<MobileSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AggiemapCoreUIModule, RouterTestingModule],
      declarations: [MobileSidebarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
