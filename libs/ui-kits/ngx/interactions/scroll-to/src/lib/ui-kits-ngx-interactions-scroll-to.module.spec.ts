import { async, TestBed } from '@angular/core/testing';
import { UIScrollToModule } from './ui-kits-ngx-interactions-scroll-to.module';

describe('UIScrollToModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UIScrollToModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UIScrollToModule).toBeDefined();
  });
});
