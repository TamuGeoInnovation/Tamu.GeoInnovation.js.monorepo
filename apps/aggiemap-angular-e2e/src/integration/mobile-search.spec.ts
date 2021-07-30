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
      cy.wait(1000)
    })

    it('Drag Pop-up Into User View', () => {
      cy.get('tamu-gisc-feature-mobile-popup').should('be.visible')
      cy.get('.handle').move({ x: 0, y: -60, force: true})
    })

    it('Check Popup Results', () => {
      // check is correct building information is displayed
      cy.get('.feature-style-1')
        .should('contain.text', 'Rudder Tower')
        .and('be.visible')
      cy.get('.feature-style-2')
        .should('contain.text', 'Building 0446')
        .and('be.visible')
      cy.get('.feature-style-2 > :nth-child(1)')
         .should('contain.text', '401 Joe Routt Bl')
         .and('be.visible')
      cy.get('.feature-style-2 > :nth-child(2)')
         .should('contain.text', 'College Station')
         .and('be.visible')
      cy.get('.feature-style-2 > :nth-child(3)')
         .should('contain.text', '77843')
         .and('be.visible')

      // check if correct copy URL is displayed
      cy.get('tamu-gisc-copy-field')
        .should('be.visible')
        .and('contain.text', 'https://aggiemap.tamu.edu/?bldg=0446')
      cy.wait(2000)
    })

    it('Check Navigation', () => {
      cy.get('.button')
        .should('have.attr', 'building-number', '0446')
      cy.contains('Directions To Here')
        .should('be.visible')
        .click()
        .wait(2000)
      /* 
        potentially add zoom out feature that 
        would allow me to click location further away 
        from target location 
      */
      //cy.get('canvas').move({ x: 500, y: 200, force: true})
      cy.get('canvas')
        .click('bottomLeft')  // click random location
        .wait(2000)

      // drag popup up and check if route features are displayed
      cy.get('.handle')
        .move({ x: 0, y: -60, force: true})
      cy.get('.directions-overview')
        .should('be.visible')

    })

  })
})