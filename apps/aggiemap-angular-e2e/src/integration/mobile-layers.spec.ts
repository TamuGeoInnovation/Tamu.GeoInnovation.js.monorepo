/// <reference path="../support/index.d.ts" />
import {mobileSizes} from "./resolutions";

mobileSizes.forEach((size) => {
  describe(`Test Elements on Mobile Layers Page: ${size} resolution`, function() {
    beforeEach(() => {
      cy.viewport(size[0], size[1])
      cy.intercept("GET", "**/TAMU_BaseMap/**").as("basemap")
      cy.intercept("GET", "**/Construction_2018/**").as("construction")
      cy.intercept("GET", "**/Physical_Distancing_Tents/**").as("tents")
      cy.visit('https://aggiemap.tamu.edu/map/m')
      cy.get('canvas').should('be.visible', {timeout: 5000})
      // open menu
      cy.get('.material-icons.left').trigger('mouseover').click()
      // open layer options
      cy.contains('Layers').click()
    })

    it('Construction Zone', function() {
      cy.wait('@construction')
      cy.checkLayer('8', 'Construction Zone')
      cy.checkLegend('8', 'Construction Zone')
      cy.get('tamu-gisc-layer-list').should('be.visible')
      // close layer options
      cy.contains('arrow_back').click()
      // close menu
      cy.get('tamu-gisc-backdrop').click('right', {force: true})
      // click location of a known construction zone
      if (size[0] === 375) {
        cy.wait(2000)
        cy.get('canvas').click(340, 200)
      }
      else if (size[0] === 768) {
        cy.wait(2000)
        cy.get('canvas').click(540, 300)
      }
      else if (size[0] === 411) {
        cy.wait(2000)
        cy.get('canvas').click(350, 150)
      }
      else if (size[0] === 360) {
        cy.wait(2000)
        cy.get('canvas').click(325, 115)
      }
      // checks if popup is visible
      cy.wait(2000)
      cy.get('tamu-gisc-feature-mobile-popup').should('be.visible')
    })

    it('Points of Interest', function() {
      cy.intercept('GET', '**/MapInfo_20190529/**')
        .as("POI")
        cy.checkLayer('7','Points of Interest')
        cy.checkLegend('7', 'Points of Interest')
      cy.get('tamu-gisc-layer-list').should('be.visible')
      // toggle POI
      cy.contains('Points of Interest').click()
      // close layer options
      cy.contains('arrow_back').click()
      // close menu
      cy.get('tamu-gisc-backdrop').click('right', {force: true})
      // click location of a known POI
      if (size[0] === 375) {
        cy.wait(2000)
        cy.get('canvas').click(245, 210)
      }
      else if (size[0] === 768) {
        cy.wait(2000)
        cy.get('canvas').click(440, 300)
      }
      else if (size[0] === 411) {
        cy.wait(2000)
        cy.get('canvas').click(260, 175)
      }
      else if (size[0] === 360) {
        cy.wait(2000)
        cy.get('canvas').click(245, 125)
      }
      // checks if popup is visible
      cy.wait(2000)
      cy.get('tamu-gisc-feature-mobile-popup').should('be.visible')
        .and('contain.text', 'Fish Pond')
    })

    it('Restrooms', function() {
      cy.intercept('GET', '*')
        .as("restrooms")
      cy.checkLayer('6','Restrooms')
      cy.checkLegend('6', 'Restrooms')
      cy.get('tamu-gisc-layer-list').should('be.visible')
      // toggle restrooms
      cy.contains('Restrooms').click()
      // close layer options
      cy.contains('arrow_back').click()
      // close menu
      cy.get('tamu-gisc-backdrop').click('right', {force: true})
      // click location of a known Restroom
      if (size[0] === 375) {
        cy.wait(2000)
        cy.get('canvas').click(250, 325)
      }
      else if (size[0] === 768) {
        cy.wait(2000)
        cy.get('canvas').click(450, 450)
      }
      else if (size[0] === 411) {
        cy.wait(2000)
        cy.get('canvas').click(250, 275)
      }
      else if (size[0] === 360) {
        cy.wait(2000)
        cy.get('canvas').click(230, 240)
      }
      // checks if popup is visible
      cy.wait(2000)
      cy.get('tamu-gisc-feature-mobile-popup').should('be.visible')
        .and('contain.text', 'Unisex Restroom')
    })

    it('Lactation Rooms', function() {
      cy.intercept('GET', '*')
        .as("lactation")
      cy.checkLayer('5', 'Lactation Rooms')
      cy.checkLegend('5', 'Lactation Rooms')
      cy.get('tamu-gisc-layer-list').should('be.visible')
      // toggle lactation rooms
      cy.contains('Lactation Rooms').click()
      // close layer options
      cy.contains('arrow_back').click()
      // close menu
      cy.get('tamu-gisc-backdrop').click('right', {force: true})
      // click location of a known Lactation Room
      if (size[0] === 375) {
        cy.wait(2000)
        cy.get('canvas').click(225, 350)
      }
      else if (size[0] === 768) {
        cy.wait(2000)
        cy.get('canvas').click(430, 445)
      }
      else if (size[0] === 411) {
        cy.wait(2000)
        cy.get('canvas').click(230, 300)
      }
      else if (size[0] === 360) {
        cy.wait(2000)
        cy.get('canvas').click(225, 260)
      }
      // checks if popup is visible
      cy.wait(2000)
      cy.get('tamu-gisc-feature-mobile-popup').should('be.visible')
      .and('contain.text', 'Lactation Room')
    })
    
    it('Visitor Parking', function() {
      cy.intercept('GET', '*')
        .as("visitor")
        cy.checkLayer('4', 'Visitor Parking')
        cy.checkLegend('4', 'Visitor Parking')
      cy.get('tamu-gisc-layer-list').should('be.visible')
      // toggle visitor parking
      cy.contains('Visitor Parking').click()
      // close layer options
      cy.contains('arrow_back').click()
      // close menu
      cy.get('tamu-gisc-backdrop').click('right', {force: true})
      // click location of a known visitor parking
      if (size[0] === 375) {
        cy.wait(2000)
        cy.get('canvas').click(275, 475)
      }
      else if (size[0] === 768) {
        cy.wait(2000)
        cy.get('canvas').click(460, 580)
      }
      else if (size[0] === 411) {
        cy.wait(2000)
        cy.get('canvas').click(300, 430)
      }
      else if (size[0] === 360) {
        cy.wait(2000)
        cy.get('canvas').click(275, 390)
      }
      // checks if popup is visible
      cy.wait(2000)
      cy.get('tamu-gisc-feature-mobile-popup').should('be.visible')
      .and('contain.text', 'Visitor Parking Kiosk')
    })

    it('Accessible Entrances', function() {
      cy.intercept('GET', '*')
        .as("accessible")
      cy.checkLayer('3', 'Accessible Entrances')
      cy.checkLegend('3', 'Accessible Entrances')
      cy.get('tamu-gisc-layer-list').should('be.visible')
      // toggle accessible entrances
      cy.contains('Accessible Entrances').click()
      // close layer options
      cy.contains('arrow_back').click()
      // close menu
      cy.get('tamu-gisc-backdrop').click('right', {force: true})
      // click location of an accessible entrance
      if (size[0] === 375) {
        cy.wait(2000)
        cy.get('canvas').click(250, 325)
      }
      else if (size[0] === 768) {
        cy.wait(2000)
        cy.get('canvas').click(450, 420)
      }
      else if (size[0] === 411) {
        cy.wait(2000)
        cy.get('canvas').click(275, 275)
      }
      else if (size[0] === 360) {
        cy.wait(2000)
        cy.get('canvas').click(250, 240)
      }
      // checks if popup is visible
      cy.wait(2000)
      cy.get('tamu-gisc-feature-mobile-popup').should('be.visible')
      .and('contain.text', 'Accessible Entrance')
    })

    it('Emergency Phones', function() {
      cy.intercept('GET', '*')
        .as("emergency")
      cy.wait("@emergency")
      cy.checkLayer('2', 'Emergency Phone')
      cy.checkLegend('2', 'Emergency Phone')
      cy.get('tamu-gisc-layer-list').should('be.visible')
      // toggle emergency phones
      cy.contains('Emergency Phones').click()
      // close layer options
      cy.contains('arrow_back').click()
      // close menu
      cy.get('tamu-gisc-backdrop').click('right', {force: true})
    })

    it.only('Physical Distance Study Area', function() {
      cy.wait("@tents")
        cy.checkLayer('1', 'Physical Distance Study Area')
        cy.checkLegend('1', 'Physical Distance Study Area')
      cy.get('tamu-gisc-layer-list').should('be.visible')
      // close layer options
      cy.contains('arrow_back').click()
      // close menu
      cy.get('tamu-gisc-backdrop').click('right', {force: true})
      // click location of a known study area
      if (size[0] === 375) {
        cy.wait(2000)
        cy.get('canvas').click(330, 200)
      }
      else if (size[0] === 768) {
        cy.wait(2000)
        cy.get('canvas').click(525, 300)
      }
      else if (size[0] === 411) {
        cy.wait(2000)
        cy.get('canvas').click(350, 150)
      }
      else if (size[0] === 360) {
        cy.wait(2000)
        cy.get('canvas').click(325, 115)
      }
      // checks if popup is visible
      cy.wait(2000)
      cy.get('tamu-gisc-feature-mobile-popup').should('be.visible')
      cy.get('.feature-style-1').should('be.visible')
        .and('contain.text', 'Fermier/Thompson Hall Physical Distance Study Area')
    })



  })
})


