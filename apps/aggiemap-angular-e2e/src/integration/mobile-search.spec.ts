/// <reference path="../support/index.d.ts" />
import {mobileSizes} from "./resolutions";

mobileSizes.forEach((size) => {
  describe(`Test Different Route Options on Mobile Layers Page: ${size} resolution`, function() {
    beforeEach(() => {
      cy.viewport(size[0], size[1])
      cy.intercept("GET", "**/TAMU_BaseMap/**").as("basemap")
      cy.intercept("GET", "**/Construction_2018/**").as("construction")
      cy.intercept("GET", "**/Physical_Distancing_Tents/**").as("tents")
      cy.visit('https://aggiemap.tamu.edu/map/m')
      cy.get('canvas').should('be.visible', {timeout: 5000})
    })

    it('Input Building Search', () => {
        cy.get('tamu-gisc-search-mobile').click()
        cy.get('.margin-left').type('Rudder Tower')
        cy.get('.search-results-container').should('be.visible')
        cy.contains('Rudder Tower (0446)').click()
        cy.get('.feature-style-1').should('contain.text', 'Rudder Tower')
      })

  })
})