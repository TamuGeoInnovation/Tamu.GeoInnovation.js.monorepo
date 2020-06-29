import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioBuilderComponent } from './scenario-builder.component';

describe('ScenarioBuilderComponent', () => {
  let component: ScenarioBuilderComponent;
  let fixture: ComponentFixture<ScenarioBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScenarioBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenarioBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
