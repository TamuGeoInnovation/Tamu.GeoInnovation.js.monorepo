import { getGreeting } from '../support/app.po';

describe('aggiemap-angular', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to aggiemap-angular!');
  });
});
