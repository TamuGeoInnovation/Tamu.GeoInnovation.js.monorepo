/// <reference path="../support/index.d.ts" />
import {desktopSizes} from "./resolutions";

desktopSizes.forEach((size) => {
  describe('Routing Options', () => {
    beforeEach(() => {
      cy.intercept("GET", "**/TAMU_BaseMap/**").as("basemap")
      cy.visit('https://aggiemap.tamu.edu/map/d/trip/options')
      cy.wait('@basemap')
      cy.get('canvas')
        .should('be.visible', {timeout: 5000})
    })

    it('Title Logo', () => {
      cy.checkTitleLogo()
    })
    it('Return Button', () => {
      cy.get('#options-return')
        .should('have.attr', 'role', 'button')
        .and('have.attr', 'Title', 'Return to trip planner')
        .and('contain', 'arrow_back')
    })
    it('Option Title', () => {
      cy.contains('.sidebar-component-name > p', 'General')
    })
    it('Option Label', () => {
      cy.contains('label', 'Accessible Friendly Directions')
    })
    it('Option Description', () => {
      cy.contains('.description.ng-star-inserted', 'Will attempt to calculate a route with accessible access such as ramps, doors, etc.')
    })
    it('Test Checkbox', () => {
      cy.get('tamu-gisc-checkbox')
        .as('option')
      cy.get('@option')
        .find('i')
        .as('checkBox')
        .should('have.class', 'material-icons')
      cy.get('@option')
        .click()
      cy.get('@checkBox')
        .should('have.class', 'material-icons active')
    })
  })
})