/// <reference path="../support/index.d.ts" />

describe('Check Map is Loaded', function() {
  beforeEach(() => {
    cy.server()
    cy.checkMapApi('**/TAMU_BaseMap/**', 'GET', 'basemap')
    cy.visit('https://aggiemap.tamu.edu/map/d')
    cy.get('canvas')
      .should('be.visible', {timeout: 5000})
    cy.wait('@basemap')
    cy.fixture('icons').then(function(data) {
      this.data = data;
    })
  })
  
  afterEach(() => {
    cy.server({enable: false})
  })

  it('Construction Zone', function() {
    cy.checkMapApi('**/Construction_2018/**', 'GET', 'construction')
    cy.wait('@construction')
    cy.checkLayer('1', 'Construction Zone')
    cy.checkLegend('9', 'Construction Area')
    cy.checkIcon('9',this.data.construction, 'Construction Area')
  })
  it('Points of Interest', function() {
    cy.checkButtonApi('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(2)', '**/MapInfo_20190529/**')
    cy.checkLayer('2','Points of Interest')
    cy.checkLegend('10', 'Points of Interest')
    cy.checkIcon('10',this.data.pointsOfInterest, 'Points of Interest')

  })
  it('Restrooms', function() {
    cy.checkButtonApi('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(3)', '*')
    cy.checkLayer('3','Restrooms')
    cy.checkLegend('10', 'Unisex Restrooms')
    cy.checkIcon('10',this.data.restrooms, 'Unisex Restrooms')

  })
  it('Lactation Rooms', function() {
    cy.checkButtonApi('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(4)', '*')
    cy.checkLayer('4', 'Lactation Rooms')
    cy.checkLegend('10', 'Lactation Rooms')
    cy.checkIcon('10',this.data.lactationRooms, 'Lactation Rooms')

  })
  it('Visitor Parking', function() {
    cy.checkButtonApi('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(5)', '*')
    cy.checkLayer('5', 'Visitor Parking')
    cy.checkLegend('10', 'Visitor Parking')
    cy.checkIcon('10',this.data.visitorParking, 'Visitor Parking')

  })
  it('Accessible Entrances', function() {
    cy.checkButtonApi('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(6)', '*')
    cy.checkLayer('6', 'Accessible Entrances')
    cy.checkLegend('10', 'Assisted Open Entrance')
    cy.checkIcon('10',this.data.accessibleEntrances, 'Assisted Open Entrance')

  })
  it('Emergency Phones', function() {
    cy.checkButtonApi('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(7)', '*')
    cy.checkLayer('7', 'Emergency Phone')
    cy.checkLegend('10', 'Emergency Phone')
    cy.checkIcon('10',this.data.emergencyPhones, 'Emergency Phone')

  })
  it('Physical Distance Study Area', function() {
    cy.checkMapApi(`**/Physical_Distancing_Tents/**`, 'GET', 'tents')
    cy.checkLayer('8', 'Physical Distance Study Area')
    cy.checkLegend('10', 'Physical Distance Study Area')
    cy.checkIcon('10',this.data.physicalDistanceStudyArea, 'Physical Distance Study Area')

  })
})