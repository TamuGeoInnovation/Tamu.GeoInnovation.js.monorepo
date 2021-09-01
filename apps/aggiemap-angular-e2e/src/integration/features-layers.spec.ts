/// <reference path="../support/index.d.ts" />
import {desktopSizes} from "./resolutions";

desktopSizes.forEach((size) => {
  describe(`Test Layers, Feature Page: ${size} Resolution`, function() {
    beforeEach(() => {
      cy.viewport(size[0], size[1])
      cy.intercept("GET", "**/TAMU_BaseMap/**").as("basemap")
      cy.intercept("GET", "**/Construction_2018/**").as("construction")
      cy.intercept("GET", "**/Physical_Distancing_Tents/**").as("tents")
      cy.visit('https://aggiemap.tamu.edu/map/d')
      cy.intercept("GET", '*solve?doNotLocateOnRestrictedElements*travelMode=1&f=json*',
        { fixture: 'walk-route-data.json' }).as('walkRouteData')
      cy.intercept("GET", '*solve?doNotLocateOnRestrictedElements*travelMode=7&f=json*',
        { fixture: 'bike-route-data.json' }).as('bikeRouteData')
      cy.intercept("GET", '*solve?doNotLocateOnRestrictedElements*travelMode=8&f=json*',
        { fixture: 'car-route-data.json' }).as('carRouteData')
      cy.intercept("GET", '*solve?doNotLocateOnRestrictedElements*travelMode=5&f=json*',
        { fixture: 'bus-route-data.json' }).as('busRouteData')
      cy.get('canvas').should('be.visible', {timeout: 5000})
      cy.wait('@basemap',{requestTimeout: 1000, responseTimeout: 1000})
      cy.fixture('icons').then(function(data) {
        this.data = data;
      })
    })

    it('Construction Zone', function() {
      cy.wait('@construction')
      cy.checkLayer('8', 'Construction Zone')
      cy.checkLegend('8', 'Construction Zone')
      // click location of a known construction zone for multiple resolutions
      if (size[0] === 1920) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(900, 650)
      }
      else if (size[0] === 1366) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(625, 500)
      }
      else if (size[0] === 1440) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(670, 555)
      }
      // checks if popup is visible
      cy.checkPopUp()
    })
    it('Points of Interest', function() {
      cy.intercept('GET', '**/MapInfo_20190529/**')
        .as("POI")
      cy.get(':nth-child(7) > .layer-item > :nth-child(1)')
        .trigger('mouseover').click().should('be.visible')
      cy.wait('@POI')
      cy.checkLayer('7','Points of Interest')
      cy.checkLegend('7', 'Points of Interest')
      // click location of a known point of interest for multiple resolutions
      if (size[0] === 1920) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(1125, 655)
      }
      else if (size[0] === 1366) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(845, 505)
      }
      else if (size[0] === 1440) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(880, 575)
      }
      // checks if popup is visible
      cy.checkPopUp()
      // click "Directions To Here for poi"
      cy.get('.button').click()
      // confirm navigation window pop-up by verifying URL
      cy.checkNavPanel()
      // click random location on map to begin route
      cy.wait(2000)
      cy.get('canvas').trigger('mouseover').click((size[0]/2), (size[1]/2))
      // checks if directions are displayed
      cy.get('.directions-container').should('be.visible')
      // check if route duration is displayed
      cy.get('.quantity').should('be.visible')
      // check if route length is displayed
      cy.get('.unit').should('be.visible')
      // test car route option
      cy.get('.travel-modes > :nth-child(3) > div')
          .click()
          .should('have.class', 'active')
      cy.get('.directions-container').should('be.visible')
      // test bus route option
      cy.get('.travel-modes > :nth-child(4) > div')
          .click()
          .should('have.class', 'active')
      cy.get('.directions-container').should('be.visible')
    })
    it('Restrooms', function() {
      cy.intercept('GET', '*')
        .as("restrooms")
      cy.get(':nth-child(6) > .layer-item > :nth-child(1)')
        .trigger('mouseover').click().should('be.visible')
      cy.wait("@restrooms")    
      cy.checkLayer('6','Restrooms')
      cy.checkLegend('6', 'Restrooms')
      // click location of a known restroom locations by pixels for multiple resolutions
      if (size[0] === 1920) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(1105, 580)
      }
      else if (size[0] === 1366) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(830, 440)
      }
      else if (size[0] === 1440) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(865, 505)
      }
      // checks if popup is visible
      cy.checkPopUp()
    })
    
    it('Lactation Rooms', function() {
      cy.intercept('GET', '*')
        .as("lactation")
        cy.get(':nth-child(5) > .layer-item > :nth-child(1)')
        .trigger('mouseover').click().should('be.visible')
      cy.wait("@lactation")      
      cy.checkLayer('5', 'Lactation Rooms')
      cy.checkLegend('5', 'Lactation Rooms')
      // click location of a known lactation room locations by pixels for multiple resolutions
      if (size[0] === 1920) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(1100, 600)
      }
      else if (size[0] === 1366) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(820, 455)
      }
      else if (size[0] === 1440) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(860, 520)
      }
      // checks if popup is visible
      cy.checkPopUp()
      // check "Additional Information" link
      cy.get('tamu-gisc-lactation-popup-component > .popup-section').should('be.visible')
      cy.checkLink('Additional Information', 'https://studentlife.tamu.edu/wrc.bfwh.lactationspace')
    })
    it('Visitor Parking', function() {
      cy.intercept('GET', '*')
        .as("visitor")
        cy.get(':nth-child(4) > .layer-item > :nth-child(1)')
        .trigger('mouseover').click().should('be.visible')
      cy.wait("@visitor")     
      cy.checkLayer('4', 'Visitor Parking')
      cy.checkLegend('4', 'Visitor Parking')
      // click location of a known visitor parking locations by pixels for multiple resolutions
      if (size[0] === 1920) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(1050, 620)
      }
      else if (size[0] === 1366) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(770, 460)
      }
      else if (size[0] === 1440) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(810, 520)
      }
      // checks if popup is visible
      cy.checkPopUp()
    })
    it('Accessible Entrances', function() {
      cy.intercept('GET', '*')
        .as("accessible")
      cy.get(':nth-child(3) > .layer-item > :nth-child(1)')
        .trigger('mouseover').click().should('be.visible')
      cy.wait("@accessible")
      cy.checkLayer('3', 'Accessible Entrances')
      cy.checkLegend('3', 'Accessible Entrances')
      // click location of a known accessible entrance locations by pixels for multiple resolutions
      if (size[0] === 1920) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(980, 575) 
      }
      else if (size[0] === 1366) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(700, 435)
      }
      else if (size[0] === 1440) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(740, 500)
      }
      // checks if popup is visible
      cy.checkPopUp()
    })
    it('Emergency Phones', function() {
      cy.intercept('GET', '*')
        .as("emergency")
      cy.get(':nth-child(2) > .layer-item > :nth-child(1)')
        .trigger('mouseover').click().should('be.visible')
      cy.wait("@emergency")
      cy.checkLayer('2', 'Emergency Phone')
      cy.checkLegend('2', 'Emergency Phone')
    })
    it('Physical Distance Study Area', function() {
      cy.wait('@tents')    
      cy.checkLayer('1', 'Physical Distance Study Area')
      cy.checkLegend('1', 'Physical Distance Study Area')
      // click location of a known study area locations by pixels for multiple resolutions
      if (size[0] === 1920) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(1160, 540)
        cy.wait(5000)
      }
      else if (size[0] === 1366) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(880, 390)
      }
      else if (size[0] === 1440) {
        cy.wait(2000)
        cy.get('canvas').trigger('mouseover').click(920, 460)
      }
      // checks if popup is visible
      cy.checkPopUp()
      // click "Directions To Here for study areas"
      cy.get('tamu-gisc-tent-zone > .popup-section > .button').click()
      // confirm navigation window pop-up by verifying URL
      cy.checkNavPanel()
      // click random location on map to begin route
      cy.get('canvas').trigger('mouseover').click((size[0]/2), (size[1]/2))
      // checks if directions are displayed
      cy.get('.directions-container').should('be.visible')
      // check if route duration is displayed
      cy.get('.quantity').should('be.visible')
      // check if route length is displayed
      cy.get('.unit').should('be.visible')
      // test car route option
      cy.get('.travel-modes > :nth-child(3) > div')
          .click()
          .should('have.class', 'active')
      cy.get('.directions-container').should('be.visible')
      // test bus route option
      cy.get('.travel-modes > :nth-child(4) > div')
          .click()
          .should('have.class', 'active')
      cy.get('.directions-container').should('be.visible')
    })
  })
})