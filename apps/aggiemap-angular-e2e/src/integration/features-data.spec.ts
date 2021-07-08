/// <reference path="../support/index.d.ts" />
import {desktopSizes} from "./resolutions";

// runs the same tests on different resolutions
desktopSizes.forEach((size) => {
  describe(`Test Elements, Features Page: ${size} Resolution`, () => {
    beforeEach(() => {
      cy.viewport(size[0], size[1])
      cy.intercept("GET", "**/TAMU_BaseMap/**").as("basemap")
      cy.visit('https://aggiemap.tamu.edu/map/d')
      cy.get('canvas').should('be.visible', {timeout: 5000})
      cy.wait('@basemap',{requestTimeout: 2000, responseTimeout: 2000})
    })

    it('Check Location', () => {
      cy.location('protocol').should('eq', 'https:')
    })
    
    it(`Sidebar Movement - Feature Toggle`, () => {
      cy.getFeatureToggle().click({force: true}).click({force: true})
      cy.getSideBar('not.be.visible')
      cy.getFeatureToggle().click({force: true})
      cy.getSideBar('be.visible')
    })

    // checks if icons appear on map after being clicked
    it('Display Physical Distance Study Area Locations', () => {
     cy.checkMapIcon()
    })

    it('Display Emergency Phone Locations', () => {
      // click emergency phones
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(2)')
        .trigger('mouseover').click().should('be.visible')
      cy.checkMapIcon()
    })

    it('Display Accessible Entrance Locations', () => {
      // click Accessible Entrance
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(3)')
        .trigger('mouseover').click().should('be.visible')
      cy.checkMapIcon()
    })

    it('Display Visitor Parking Locations', () => {
      // click Visitor Parking
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(4)')
        .trigger('mouseover').click().should('be.visible')
      cy.checkMapIcon()
    })

    it('Display Lactation Room Locations', () => {
      // click Lactation Rooms
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(5)')
        .trigger('mouseover').click().should('be.visible')
      cy.checkMapIcon()
    })

    it('Display Restroom Locations', () => {
      // click Restrooms
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(6)')
        .trigger('mouseover').click().should('be.visible')
      cy.checkMapIcon()
    })

    it('Display Points of Interest Locations', () => {
      // click Points of Interest
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(7)')
        .trigger('mouseover').click().should('be.visible')
      cy.checkMapIcon()
    })

    it('Display Construction Zone Locations', () => {
      cy.checkMapIcon()
    })

    it('Check Latitude and Longitude', () => {
      cy.get('canvas').click((size[0]/2), (size[1]/2))
      // check if coordinates are visible on the map
      cy.get('tamu-gisc-click-coordinates > .point-coords')
        .should('be.visible')
        .and('contain', 'Latitude: 30.61306')
        .and('contain', 'Longitude: -96.34467') //check if coordinates are correct
      // checks if coordinates change after clicking new location
      cy.get('canvas').click((size[0]/4), (size[1]/4))
      // cy.get('tamu-gisc-click-coordinates > .point-coords')
         .should('not.contain', 'Latitude: 30.61306')
         .and('not.contain', 'Longitude: -96.34467')
      // check if coordinates are copied after clicking
    })


    // test help options and check if the destination is correct
    it(`Displays Help Options`, () => {
      cy.getHelpButton().click()
      cy.get('.topics').should('be.visible')
      cy.checkLink('Map Instructions', '/instructions')
      cy.checkLink('Building Directory', '/directory')
      cy.checkLink('Feedback', 'https://aggiemap.tamu.edu/feedback.asp')
      cy.checkLink('About', '/about')
      cy.checkLink('Move-in Parking App', 'https://aggiemap.tamu.edu/movein/')
      cy.checkLink('Graduation Parking App', 'https://aggiemap.tamu.edu/graduation/arrival')
      cy.checkLink('Site Policies', 'https://www.tamu.edu/statements/index.html')
      cy.checkLink('Accessibility Policy', 'http://itaccessibility.tamu.edu')
      cy.checkLink('Privacy & Security', '/privacy')
      cy.checkLink('Changelog', '/changelog')
    })
  })
})
