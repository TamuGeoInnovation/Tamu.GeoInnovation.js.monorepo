import { TestBed, async, inject } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create the app', () => {
    inject([AppComponent], (app: AppComponent) => {
      expect(app).toBeTruthy();
    });
  });

  it(`should have as title 'gisday-competition'`, () => {
    inject([AppComponent], (app: AppComponent) => {
      expect(app.title).toEqual('gisday-competition');
    });
  });
});
