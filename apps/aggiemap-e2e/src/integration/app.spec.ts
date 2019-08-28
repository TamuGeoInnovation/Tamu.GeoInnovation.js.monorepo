import { getGreeting } from '../support/app.po';

describe('aggiemap', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to aggiemap!');
  });
});
