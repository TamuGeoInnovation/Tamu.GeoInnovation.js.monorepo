/// <reference path="../support/index.d.ts" />
import { desktopSizes } from './resolutions';

desktopSizes.forEach((size) => {
  describe(`Test Layers, Feature Page: ${size} Resolution`, function () {
    beforeEach(() => {
      cy.viewport(size[0], size[1]);
      cy.intercept('GET', '**/TAMU_BaseMap/**').as('basemap');
      cy.intercept('GET', '**/Construction_2018/**').as('construction');
      cy.intercept('GET', '**/Physical_Distancing_Tents/**').as('tents');
      cy.visit('https://aggiemap.tamu.edu/map/d');
      cy.get('canvas').should('be.visible', { timeout: 5000 });
      cy.wait('@basemap', { requestTimeout: 1000, responseTimeout: 1000 });
      cy.fixture('icons').then(function (data) {
        this.data = data;
      });
    });

    it('Construction Zone', function () {
      cy.wait('@construction');
      cy.checkLayer('1', 'Construction Zone');
      cy.checkLegend('9', 'Construction Area');
      cy.checkIcon('9', this.data.construction, 'Construction Area');
    });
    it('Points of Interest', function () {
      cy.intercept('GET', '**/MapInfo_20190529/**').as('POI');
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(2)').click({ force: true });
      cy.wait('@POI');
      cy.checkLayer('2', 'Points of Interest');
      cy.checkLegend('10', 'Points of Interest');
      cy.checkIcon('10', this.data.pointsOfInterest, 'Points of Interest');
    });
    it('Restrooms', function () {
      cy.intercept('GET', '*').as('restrooms');
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(3)').click({ force: true });
      cy.wait('@restrooms');
      cy.checkLayer('3', 'Restrooms');
      cy.checkLegend('10', 'Unisex Restrooms');
      cy.checkIcon('10', this.data.restrooms, 'Unisex Restrooms');
    });
    it('Lactation Rooms', function () {
      cy.intercept('GET', '*').as('lactation');
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(4)').click({ force: true });
      cy.wait('@lactation');
      cy.checkLayer('4', 'Lactation Rooms');
      cy.checkLegend('10', 'Lactation Rooms');
      cy.checkIcon('10', this.data.lactationRooms, 'Lactation Rooms');
    });
    it('Visitor Parking', function () {
      cy.intercept('GET', '*').as('visitor');
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(5)').click({ force: true });
      cy.wait('@visitor');
      cy.checkLayer('5', 'Visitor Parking');
      cy.checkLegend('10', 'Visitor Parking');
      cy.checkIcon('10', this.data.visitorParking, 'Visitor Parking');
    });
    it('Accessible Entrances', function () {
      cy.intercept('GET', '*').as('accessible');
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(6)').click({ force: true });
      cy.wait('@accessible');
      cy.checkLayer('6', 'Accessible Entrances');
      cy.checkLegend('10', 'Assisted Open Entrance');
      cy.checkIcon('10', this.data.accessibleEntrances, 'Assisted Open Entrance');
    });
    it('Emergency Phones', function () {
      cy.intercept('GET', '*').as('emergency');
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(7)').click({ force: true });
      cy.wait('@emergency');
      cy.checkLayer('7', 'Emergency Phone');
      cy.checkLegend('10', 'Emergency Phone');
      cy.checkIcon('10', this.data.emergencyPhones, 'Emergency Phone');
    });
    it('Physical Distance Study Area', function () {
      cy.wait('@tents');
      cy.checkLayer('8', 'Physical Distance Study Area');
      cy.checkLegend('10', 'Physical Distance Study Area');
      cy.checkIcon('10', this.data.physicalDistanceStudyArea, 'Physical Distance Study Area');
    });
  });
});
