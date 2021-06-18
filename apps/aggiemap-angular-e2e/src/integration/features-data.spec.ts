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
      // intercept server request when clicked
      cy.intercept('GET','https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer/1/query?f=json&geometry=%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D&maxRecordCountFactor=3&outFields=*&outSR=102100&quantizationParameters=%7B%22extent%22%3A%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D%2C%22mode%22%3A%22view%22%2C%22originPosition%22%3A%22upperLeft%22%2C%22tolerance%22%3A2.388657133911135%7D&resultType=tile&returnExceededLimitFeatures=false&spatialRel=esriSpatialRelIntersects&where=1%3D1&geometryType=esriGeometryEnvelope&inSR=102100').as('studyArea')
      cy.wait('@studyArea')
    })

    it('Display Emergency Phone Locations', () => {
      // click emergency phones
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(2)')
        .trigger('mouseover').click().should('be.visible')
      // intercept server request when clicked
      cy.intercept('GET','https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer/4/query?f=json&geometry=%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D&maxRecordCountFactor=3&outFields=*&outSR=102100&quantizationParameters=%7B%22extent%22%3A%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D%2C%22mode%22%3A%22view%22%2C%22originPosition%22%3A%22upperLeft%22%2C%22tolerance%22%3A2.388657133911135%7D&resultType=tile&returnExceededLimitFeatures=false&spatialRel=esriSpatialRelIntersects&where=1%3D1&geometryType=esriGeometryEnvelope&inSR=102100').as('emPhone')
      cy.wait('@emPhone')
    })

    it('Display Accessible Entrance Locations', () => {
      // click Accessible Entrance
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(3)')
        .trigger('mouseover').click().should('be.visible')
      // intercept server request when clicked
      cy.intercept('GET','https://gis.tamu.edu/arcgis/rest/services/FCOR/ADA_120717/MapServer/0/query?f=json&geometry=%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D&maxRecordCountFactor=3&outFields=*&outSR=102100&quantizationParameters=%7B%22extent%22%3A%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D%2C%22mode%22%3A%22view%22%2C%22originPosition%22%3A%22upperLeft%22%2C%22tolerance%22%3A2.388657133911135%7D&resultType=tile&returnExceededLimitFeatures=false&spatialRel=esriSpatialRelIntersects&where=1%3D1&geometryType=esriGeometryEnvelope&inSR=102100').as('accEntrance')
      cy.wait('@accEntrance')
    })

    it('Display Visitor Parking Locations', () => {
      // click Visitor Parking
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(4)')
        .trigger('mouseover').click().should('be.visible')
      // intercept server request when clicked
      cy.intercept('GET','https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer/3/query?f=json&geometry=%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D&maxRecordCountFactor=3&outFields=*&outSR=102100&quantizationParameters=%7B%22extent%22%3A%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D%2C%22mode%22%3A%22view%22%2C%22originPosition%22%3A%22upperLeft%22%2C%22tolerance%22%3A2.388657133911135%7D&resultType=tile&returnExceededLimitFeatures=false&spatialRel=esriSpatialRelIntersects&where=1%3D1&geometryType=esriGeometryEnvelope&inSR=102100').as('visParking')
      cy.wait('@visParking')
    })

    it('Display Lactation Room Locations', () => {
      // click Lactation Rooms
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(5)')
        .trigger('mouseover').click().should('be.visible')
      // intercept server request when clicked
      cy.intercept('GET','https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer/2/query?f=json&geometry=%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D&maxRecordCountFactor=3&outFields=*&outSR=102100&quantizationParameters=%7B%22extent%22%3A%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D%2C%22mode%22%3A%22view%22%2C%22originPosition%22%3A%22upperLeft%22%2C%22tolerance%22%3A2.388657133911135%7D&resultType=tile&returnExceededLimitFeatures=false&spatialRel=esriSpatialRelIntersects&where=1%3D1&geometryType=esriGeometryEnvelope&inSR=102100').as('lactationRooms')
      cy.wait('@lactationRooms')
    })

    it('Display Restroom Locations', () => {
      // click Restrooms
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(6)')
        .trigger('mouseover').click().should('be.visible')
      // intercept server request when clicked
      cy.intercept('GET','https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer/1/query?f=json&geometry=%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D&maxRecordCountFactor=3&outFields=*&outSR=102100&quantizationParameters=%7B%22extent%22%3A%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D%2C%22mode%22%3A%22view%22%2C%22originPosition%22%3A%22upperLeft%22%2C%22tolerance%22%3A2.388657133911135%7D&resultType=tile&returnExceededLimitFeatures=false&spatialRel=esriSpatialRelIntersects&where=1%3D1&geometryType=esriGeometryEnvelope&inSR=102100').as('restrooms')
      cy.wait('@restrooms')
    })

    it('Display Points of Interest Locations', () => {
      // click Points of Interest
      cy.get('tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(7)')
        .trigger('mouseover').click().should('be.visible')
      // intercept server request when clicked
      cy.intercept('GET','https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer/0/query?f=json&geometry=%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D&maxRecordCountFactor=3&outFields=*&outSR=102100&quantizationParameters=%7B%22extent%22%3A%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D%2C%22mode%22%3A%22view%22%2C%22originPosition%22%3A%22upperLeft%22%2C%22tolerance%22%3A2.388657133911135%7D&resultType=tile&returnExceededLimitFeatures=false&spatialRel=esriSpatialRelIntersects&where=1%3D1&geometryType=esriGeometryEnvelope&inSR=102100').as('POI')
      cy.wait('@POI')
    })

    it('Display Construction Zone Locations', () => {
      // intercept server request when clicked
      cy.intercept('GET','https://gis.tamu.edu/arcgis/rest/services/FCOR/Construction_2018/MapServer/0/query?f=json&geometry=%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D&maxRecordCountFactor=3&outFields=*&outSR=102100&quantizationParameters=%7B%22extent%22%3A%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22xmin%22%3A-10725643.808976118%2C%22ymin%22%3A3580921.901105987%2C%22xmax%22%3A-10724420.816523556%2C%22ymax%22%3A3582144.8935585488%7D%2C%22mode%22%3A%22view%22%2C%22originPosition%22%3A%22upperLeft%22%2C%22tolerance%22%3A2.388657133911135%7D&resultType=tile&returnExceededLimitFeatures=false&spatialRel=esriSpatialRelIntersects&where=1%3D1&geometryType=esriGeometryEnvelope&inSR=102100').as('construction')
      cy.wait('@construction')
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
