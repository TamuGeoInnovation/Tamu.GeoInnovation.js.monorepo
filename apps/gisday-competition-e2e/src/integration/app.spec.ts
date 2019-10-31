import { getGreeting } from '../support/app.po';

describe('gisday-competition', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to gisday-competition!');
  });
});
