import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { REV_ASCII, ReveilleConsoleLogComponent } from './reveille-console-log.component';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { of } from 'rxjs';

class TestingMock {
  public get() {
    return of(false);
  }
}

describe('ReveilleConsoleLogComponent', () => {
  let component: ReveilleConsoleLogComponent;
  let fixture: ComponentFixture<ReveilleConsoleLogComponent>;

  let consoleResults = '';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReveilleConsoleLogComponent],
      providers: [
        {
          provide: TestingService,
          useClass: TestingMock
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    console.log = (message) => {
      consoleResults = message;
    };

    fixture = TestBed.createComponent(ReveilleConsoleLogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('if not development, output rev', () => {
    expect(consoleResults).toEqual(REV_ASCII);
  });
});
