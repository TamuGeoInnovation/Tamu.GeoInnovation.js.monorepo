/// <reference path="../support/index.d.ts" />
import { inRange, isTypedArray } from "cypress/types/lodash";
import {mobileSizes} from "./resolutions";

mobileSizes.forEach((size) => {
  describe(`Test Different Route Options on Mobile Layers Page: ${size} resolution`, function() {
    beforeEach(() => {
      cy.viewport(size[0], size[1])
      cy.intercept("GET", "**/TAMU_BaseMap/**").as("basemap")
      cy.intercept("GET", "**/Construction_2018/**").as("construction")
      cy.intercept("GET", "**/Physical_Distancing_Tents/**").as("tents")
      cy.intercept("GET", '**/services/Routing/**').as('routeData')
      cy.intercept('GET', '**/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer/1/query?f=json&geometry=%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10724573.690580126%2C%22ymin%22%3A3582603.5157282613%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582756.3897848316%7D&orderByFields=OBJECTID%20ASC&outFields=*&outSR=102100&quantizationParameters=%7B%22extent%22%3A%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10724573.690580126%2C%22ymin%22%3A3582603.5157282613%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582756.3897848316%7D%2C%22mode%22%3A%22view%22%2C%22originPosition%22%3A%22upperLeft%22%2C%22tolerance%22%3A0.29858214173889186%7D&resultType=tile&returnExceededLimitFeatures=false&spatialRel=esriSpatialRelIntersects&where=1%3D1&geometryType=esriGeometryEnvelope&inSR=102100', 
        { fixture: 'building-data'} )
        .as('buildingData')
    })

    const building = 'Rudder Tower'

    it('Open Aggie Map', () => {
      cy.visit('https://aggiemap.tamu.edu/map/m')
      cy.get('canvas').should('be.visible', {timeout: 5000})
    })

    it('Input Building Search', () => {
      cy.get('tamu-gisc-search-mobile')
        .should('be.visible')
        .click()
      cy.get('.margin-left').type(building)
    })

    it('Search Results Displayed', () => {
      cy.get('.search-results-container').should('be.visible')
      cy.get('.focusable').should('contain.text', building)
    })
      
    it('Click Search Result', () => {
      cy.contains('Rudder Tower (0446)').click()
      cy.get('.feature-style-1').should('contain.text', building)
      cy.wait(2000)
      cy.wait('@buildingData').then(console.log).should('have.property', 'state', 'Complete') // verify that server request is fulfilled
    })

    it('Drag Pop-up Into User View', () => {
      cy.get('tamu-gisc-feature-mobile-popup').should('be.visible')
      cy.get('.handle').move({ x: 0, y: -60, force: true})
    })

    it('Check Popup Results', () => {
      // redo test using fixture data by stubbing server response
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

    it('Check Walk Route Directions', () => {
      cy.get('.button')
        .should('have.attr', 'building-number', '0446')
      cy.contains('Directions To Here')
        .should('be.visible')
        .click()
      /* 
        potentially add zoom out feature that 
        would allow me to click location further away 
        from search location 
      */

      //TODO: Mock server response so that all routes are available
      
      
      cy.get('canvas')
        .click('bottomRight')  // click random location
        .wait(1000)

      cy.wait('@routeData', {responseTimeout: 2000, requestTimeout: 2000 }).then(console.log)

      // drag popup up and check if route features are displayed
      cy.get('.handle')
        .move({ x: 0, y: -400, force: true})
      cy.get('.directions-overview')
        .should('be.visible')
      cy.get('.directions-container')
        .should('be.visible')
      cy.get('.handle').move({ x: 0, y: 400, force: true }) // drag popup back down to access route options again
    })

    it('Check Bike Route Directions', () => {
      // click bike route option and check directions
      cy.get('tamu-gisc-trip-planner-mode-picker-mobile').should('be.visible')
      cy.get('.travel-modes > :nth-child(2) > div')
          .click()
          .should('have.class', 'active')
      cy.get('.handle').move({ x: 0, y: -400, force: true}) // drag popup back into view
      cy.get('.directions-overview')
        .should('be.visible')
      cy.get('.directions-container')
        .should('be.visible')
      cy.get('.handle').move({ x: 0, y: 400, force: true }) // drag popup back down to access route options again
    })

    it('Check Car Route Directions', () => {
      // click car route option and check directions
      cy.get('tamu-gisc-trip-planner-mode-picker-mobile').should('be.visible')
      cy.get('.travel-modes > :nth-child(3) > div')
          .click()
          .should('have.class', 'active')
      cy.get('.handle').move({ x: 0, y: -400, force: true}) // drag popup back into view
      cy.get('.directions-overview')
        .should('be.visible')
      cy.get('.directions-container')
        .should('be.visible')
      cy.get('.handle').move({ x: 0, y: 400, force: true }) // drag popup back down to access route options again
    })

    it('Check Bus Route Directions', () => {
      // click bus route option and check directions
      cy.get('tamu-gisc-trip-planner-mode-picker-mobile').should('be.visible')
      cy.get('.travel-modes > :nth-child(4) > div')
          .click()
          .should('have.class', 'active')
      cy.get('.handle').move({ x: 0, y: -400, force: true}) // drag popup back into view
      cy.get('.directions-overview')
        .should('be.visible')
      cy.get('.directions-container')
        .should('be.visible')
      cy.get('.handle').move({ x: 0, y: 500, force: true }) // drag popup back down to access route options again
    })

    it.skip('Change Start Location After Previous Route', () => {

      // click search bar for new starting location
      cy.get('.points > :nth-child(1) > .ng-tns-c91-1')
        .scrollIntoView()
        .should('be.visible')
        .click()

      // click current location
      cy.get('.focusable')
        .should('be.visible')
        .click()

      // mock geolocation
      cy.mockGeolocation()

      // click random location (no new circle should appear)


    })

  })
})