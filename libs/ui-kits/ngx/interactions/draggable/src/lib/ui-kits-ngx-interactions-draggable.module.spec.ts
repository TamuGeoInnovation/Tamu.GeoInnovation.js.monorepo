import { async, TestBed } from '@angular/core/testing';
import { UIDragModule } from './ui-kits-ngx-interactions-draggable.module';

describe('UIDragModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UIDragModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UIDragModule).toBeDefined();
  });
});
