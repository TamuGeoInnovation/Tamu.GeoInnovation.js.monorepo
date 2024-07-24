import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarReferenceComponent } from './sidebar-reference.component';

describe('SidebarReferenceComponent', () => {
  let component: SidebarReferenceComponent;
  let fixture: ComponentFixture<SidebarReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarReferenceComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

