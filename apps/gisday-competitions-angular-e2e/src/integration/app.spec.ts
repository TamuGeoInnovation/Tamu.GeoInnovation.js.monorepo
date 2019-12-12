import { getGreeting } from '../support/app.po';

describe('gisday-competitions-angular', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to gisday-competitions-angular!');
  });
});
