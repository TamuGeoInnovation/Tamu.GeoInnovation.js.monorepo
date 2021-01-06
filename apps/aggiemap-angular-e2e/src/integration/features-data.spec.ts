/// <reference path="../support/index.d.ts" />
const desktopSizes = [[1920, 1080], [1366, 768], [1440, 900]]
describe('Test Elements on Features Page', () => {
  beforeEach(() => {
    cy.intercept("GET", "**/TAMU_BaseMap/**")
      .as("basemap")
    cy.visit('https://aggiemap.tamu.edu/map/d')
    cy.wait('@basemap')
    cy.get('canvas')
      .should('be.visible', {timeout: 5000})
  })
  it('Check Location', () => {
    cy.location('protocol')
      .should('eq', 'https:')
  }) 
  describe('Test Feature page data', () => {
    desktopSizes.forEach((size) => {
      it(`Displays title on ${size} screen`, () => {
        cy.viewport(size[0], size[1])
        cy.title().should('eq', 'Aggie Map - Texas A&M University')
      })
      it(`Displays title logo on ${size} screen`, () => {
        cy.viewport(size[0], size[1])
        cy.checkTitleLogo()
      })
      it(`Displays sidebar on ${size} screen`, () => {
        cy.viewport(size[0], size[1])
        cy.getSideBar('be.visible')
      })
      it(`Displays direction toggle on ${size} screen`, () => {
        cy.viewport(size[0], size[1])
        cy.getDirectionsToggle()
      })
      it(`Displays feature toggle on ${size} screen`, () => {
        cy.viewport(size[0], size[1])
        cy.getFeatureToggle()
      })
      it(`Sidebar moves correctly using feature toggle on ${size} screen`, () => {
        cy.viewport(size[0], size[1])
        cy.getFeatureToggle()
          .click({force: true})
          .click({force: true})
        cy.getSideBar('not.be.visible')
        cy.getFeatureToggle()
          .click({force: true})
        cy.getSideBar('be.visible')
      })
      it(`Displays headings on ${size} screen`, () => {
        cy.viewport(size[0], size[1])
        cy.contains('tamu-gisc-layer-list > .sidebar-component-name', 'Layers')
        cy.contains('tamu-gisc-legend > .sidebar-component-name', 'Legend')
      })
      it(`Displays help options on ${size} screen`, () => {
        cy.viewport(size[0], size[1])
        cy.getHelpButton()
          .click()
        cy.get('.topics')
          .should('be.visible')
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

})