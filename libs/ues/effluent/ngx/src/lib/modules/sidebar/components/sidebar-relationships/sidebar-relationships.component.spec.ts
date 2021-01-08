import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UESCoreUIModule } from '@tamu-gisc/ues/common/ngx';
import { UESEffluentCoreModule } from '../../../core/core.module';

import { SidebarRelationshipsComponent } from './sidebar-relationships.component';

describe('SidebarRelationshipsComponent', () => {
  let component: SidebarRelationshipsComponent;
  let fixture: ComponentFixture<SidebarRelationshipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UESEffluentCoreModule],
      declarations: [SidebarRelationshipsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarRelationshipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
