import { async, TestBed } from '@angular/core/testing';
import { UIClipboardModule } from './ui-kits-ngx-interactions-clipboard.module';

describe('UIClipboardModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UIClipboardModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UIClipboardModule).toBeDefined();
  });
});
