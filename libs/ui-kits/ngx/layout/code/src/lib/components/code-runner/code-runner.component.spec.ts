import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHighlightOptions } from 'ngx-highlightjs';

import { ClipboardCopyDirective, CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { CodeRunnerComponent } from './code-runner.component';

describe('CodeRunnerComponent', () => {
  let component: CodeRunnerComponent;
  let fixture: ComponentFixture<CodeRunnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClipboardCopyDirective, CopyComponent, CodeRunnerComponent],
      // As geoservices sets it up: the core, the languages its samples use, and line numbers.
      providers: [
        provideHighlightOptions({
          coreLibraryLoader: () => import('highlight.js/lib/core'),
          lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
          languages: { javascript: () => import('highlight.js/lib/languages/javascript') }
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeRunnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly evaluate execute', () => {
    component.execute();
    component.execute();
    expect(component.renderable()).toBeFalsy();
  });
});
