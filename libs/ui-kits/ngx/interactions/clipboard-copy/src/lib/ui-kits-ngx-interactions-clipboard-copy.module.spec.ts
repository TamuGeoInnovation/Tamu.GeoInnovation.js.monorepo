import { async, TestBed } from '@angular/core/testing';
import { UiKitsNgxInteractionsClipboardCopyModule } from './ui-kits-ngx-interactions-clipboard-copy.module';

describe('UiKitsNgxInteractionsClipboardCopyModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UiKitsNgxInteractionsClipboardCopyModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UiKitsNgxInteractionsClipboardCopyModule).toBeDefined();
  });
});
