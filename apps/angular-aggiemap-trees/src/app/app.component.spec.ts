import { TestBed, async, inject } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create the app', () => {
    inject([AppComponent], (app: AppComponent) => {
      expect(app).toBeTruthy();
    });
  });

  it(`should have as title 'angular-aggiemap-trees'`, () => {
    inject([AppComponent], (app: AppComponent) => {
      expect(app.title).toEqual('angular-aggiemap-trees');
    });
  });
});
