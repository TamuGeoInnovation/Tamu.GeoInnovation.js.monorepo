/// <reference path="../support/index.d.ts" />
const mobileSizes = [
  [375, 677],
  [375, 812],
  [414, 896],
  [414, 846],
  [360, 760]
];
export default mobileSizes;

mobileSizes.forEach((size) => {
  describe(`Test Elements on Mobile Page: ${size} resolution`, () => {
    beforeEach(() => {
      cy.viewport(size[0], size[1]);
      cy.intercept('GET', '**/TAMU_BaseMap/**').as('basemap');
      cy.visit('https://aggiemap.tamu.edu/map/m');
      cy.wait('@basemap', { requestTimeout: 100, responseTimeout: 100 });

      cy.get('canvas').should('be.visible', { timeout: 5000 });
      cy.get('.action-icons').click();
    });
    it(`Check Location`, () => {
      cy.location('protocol').should('eq', 'https:');
    });
    it(`Displays Title`, () => {
      cy.title().should('eq', 'Aggie Map - Texas A&M University');
    });
    it(`Displays Title Logo`, () => {
      cy.checkTitleLogo();
    });
    it('Displays Menu Items', () => {
      cy.checkMenuItem('1', 'Legend').and('contain', 'keyboard_arrow_right');
      cy.checkMenuItem('2', 'Layers').and('contain', 'keyboard_arrow_right');
      cy.checkMenuItem('3', 'Building Directory');
      cy.checkMenuItem('4', 'Feedback');
      cy.checkMenuItem('5', 'About');
      cy.checkMenuItem('6', 'Site Policies');
      cy.checkMenuItem('7', 'Accessibility Policy');
      cy.checkMenuItem('8', 'Privacy & Security');
      cy.checkMenuItem('9', 'Changelog');
    });
  });
});
