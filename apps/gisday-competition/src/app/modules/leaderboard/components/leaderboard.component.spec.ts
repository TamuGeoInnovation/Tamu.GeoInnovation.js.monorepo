import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';

import { LeaderboardComponent } from './leaderboard.component';

describe('LeaderboardComponent', () => {
  let component: LeaderboardComponent;
  let fixture: ComponentFixture<LeaderboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvironmentModule, SettingsModule],
      declarations: [LeaderboardComponent],
      providers: [
        {
          provide: env,
          useValue: { LocalStoreSettings: {}, LeaderboardUrl: 'https://' }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
