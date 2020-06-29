import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeRunnerComponent } from './code-runner.component';

describe('CodeRunnerComponent', () => {
  let component: CodeRunnerComponent;
  let fixture: ComponentFixture<CodeRunnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeRunnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeRunnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
