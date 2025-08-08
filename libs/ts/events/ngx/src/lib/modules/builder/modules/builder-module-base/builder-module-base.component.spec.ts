import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderModuleBaseComponent } from './builder-module-base.component';

describe('BuilderModuleBaseComponent', () => {
  let component: BuilderModuleBaseComponent;
  let fixture: ComponentFixture<BuilderModuleBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuilderModuleBaseComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderModuleBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
