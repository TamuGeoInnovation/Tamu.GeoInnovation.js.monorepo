import { TestBed, async, inject } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ imports: [RouterTestingModule], providers: [AppComponent] }).compileComponents();
  }));

  it('should create the app', inject([AppComponent], (app: AppComponent) => {
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'trees-angular'`, inject([AppComponent], (app: AppComponent) => {
    expect(app.title).toEqual('trees-angular');
  }));
});
