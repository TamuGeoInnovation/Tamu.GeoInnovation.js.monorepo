import { getGreeting } from '../support/app.po';

describe('trees-angular', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to trees-angular!');
  });
});
