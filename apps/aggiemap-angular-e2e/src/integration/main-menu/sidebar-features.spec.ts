import { desktopSizes } from '../../support/resolutions';

// runs same the same tests on different resolutions
desktopSizes.forEach((size) => {
  describe(`Sidebar Features on ${size} Resolution`, () => {
    beforeEach(() => {
      cy.viewport(size[0], size[1]);
      cy.visit('https://localhost:4200'); // setup to run aggiemap locally
      cy.get('canvas').should('be.visible');
    });
    // Tests begin here
  });
});
