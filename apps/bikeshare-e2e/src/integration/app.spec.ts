import { getGreeting } from '../support/app.po';

describe('angular-aggiemap-trees', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to angular-aggiemap-trees!');
  });
});
