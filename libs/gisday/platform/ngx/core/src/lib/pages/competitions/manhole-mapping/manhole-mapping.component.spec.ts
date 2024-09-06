import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManholeMappingComponent } from './manhole-mapping.component';

describe('ManholeMappingComponent', () => {
  let component: ManholeMappingComponent;
  let fixture: ComponentFixture<ManholeMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManholeMappingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManholeMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
