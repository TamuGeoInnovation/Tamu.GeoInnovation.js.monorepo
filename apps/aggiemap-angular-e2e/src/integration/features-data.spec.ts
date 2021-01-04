/// <reference path="../support/index.d.ts" />
describe('Correct Page', () => {
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
  it('Title', () => {
    cy.title().should('eq', 'Aggie Map - Texas A&M University')
  })
  it('Title Logo', () => {
    cy.checkTitleLogo()
  })
  it('Sidebar', () => {
    cy.getSideBar('be.visible')
  })
  it('Directions Toggle', () => {
    cy.getDirectionsToggle()
  })
  it('Feature Toggle', () => {
    cy.getFeatureToggle()
  })
  it('Check Sidebar - Feature Toggle', () => {
    cy.getFeatureToggle()
      .click({force: true})
      .click({force: true})
    cy.getSideBar('not.be.visible')
    cy.getFeatureToggle()
      .click({force: true})
    cy.getSideBar('be.visible')
  })
  it('Headings', () => {
    cy.contains('tamu-gisc-layer-list > .sidebar-component-name', 'Layers')
    cy.contains('tamu-gisc-legend > .sidebar-component-name', 'Legend')
  })
  it('Help Button', () => {
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