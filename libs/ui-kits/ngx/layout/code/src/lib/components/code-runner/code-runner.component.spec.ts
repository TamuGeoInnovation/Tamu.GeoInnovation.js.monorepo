import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightModule } from 'ngx-highlightjs';

import { UIClipboardModule } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { CodeRunnerComponent } from './code-runner.component';

describe('CodeRunnerComponent', () => {
  let component: CodeRunnerComponent;
  let fixture: ComponentFixture<CodeRunnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HighlightModule, UIClipboardModule],
      declarations: [CodeRunnerComponent]
    }).compileComponents();
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
