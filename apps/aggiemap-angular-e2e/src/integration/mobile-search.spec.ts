/// <reference path="../support/index.d.ts" />
import {mobileSizes} from "./resolutions";

mobileSizes.forEach((size) => {
  describe(`Test Different Route Options on Mobile Layers Page: ${size} resolution`, function() {
    beforeEach(() => {
      cy.viewport(size[0], size[1])
      cy.intercept("GET", "**/TAMU_BaseMap/**").as("basemap")
      cy.intercept("GET", "**/Construction_2018/**").as("construction")
      cy.intercept("GET", "**/Physical_Distancing_Tents/**").as("tents")
    })

    it('Open Aggie Map', () => {
      cy.visit('https://aggiemap.tamu.edu/map/m')
      cy.get('canvas').should('be.visible', {timeout: 5000})
    })

    it('Input Building Search', () => {
      cy.get('tamu-gisc-search-mobile').click()
      cy.get('.margin-left').type('Rudder Tower')
    })

    it('Search Results Displayed', () => {
      cy.get('.search-results-container').should('be.visible')
      //TODO: Change to expect
      cy.get('.focusable').should('contain.text', 'Rudder Tower (0446)')
    })
      
    it('Click Search Result', () => {
      cy.contains('Rudder Tower (0446)').click()
      cy.get('.feature-style-1').should('contain.text', 'Rudder Tower')
    })

    it('Drag Pop-up Into User View', () => {
      cy.get('tamu-gisc-feature-mobile-popup').should('be.visible')
      cy.get('.popup').move({ x: 0, y: -600, position: 'center', force: true })
      // check if correct URL is present
      cy.get('tamu-gisc-copy-field')
        .should('be.visible')
        .and('contain.text', 'https://aggiemap.tamu.edu/?bldg=0446')
    })

  })
})