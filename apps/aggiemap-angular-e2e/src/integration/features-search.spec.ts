/// <reference path="../support/index.d.ts" />
describe('Search', () => {
  beforeEach(() => {
    cy.intercept("GET", "**/TAMU_BaseMap/**").as("basemap")
    cy.intercept('GET', '**/Construction_2018/**').as('construction')
    cy.intercept('GET','**/Physical_Distancing_Tents/**').as('tents')
  })
  it('Open Page', () => {
    cy.visit('https://aggiemap.tamu.edu/map/d')
    cy.wait('@basemap')
    cy.get('canvas')
      .should('be.visible', {timeout: 5000})
  })
  
  it('Create Test Search', () => {
    cy.get('.margin-left')
      .should('be.visible')
      .clear()
      .type('Computing Services Annex')
      .type('{enter}')
      /*
    for (let i = 0; i < 3; i++) {
      cy.wait(['@basemap', '@construction', '@tents'])
    }
    */
    cy.wait(10000)
    cy.get('.focusable', {timeout: 5000})
      .click({force: true})
  })

  it('Title', () => {
    cy.contains(':nth-child(1) > .feature-style-1', 'Computing Services Annex')
  })
  it('Building Number', () => {
    cy.contains('tamu-gisc-buildling-popup-component.ng-star-inserted > :nth-child(1) > :nth-child(3)', '733 Lamar St, College Station, TX 77843')
  })
  it('Copy Text', () => {
    cy.contains('.copy-text', 'https://aggiemap.tamu.edu/?bldg=0517')
      .should('have.attr', 'role', 'button')
  })
  it('Copy Button', () => {
    cy.contains('.copy-button', 'Copy')
      .should('have.attr', 'role', 'button')
  })
  it('Directions Button', () => {
    cy.contains('.button', 'Directions To Here')
      .should('have.attr', 'role', 'button')
      .should('have.attr', 'building-number', '0517')
  })
  it('Building Proctors Button', () => {
    cy.contains('#building-proctors', 'Building Proctors')
      .should('have.attr', 'building', '0517')
    cy.get('.no-decor')
      .should('have.attr', 'href', 'https://proctorlist.tamu.edu/MainProctorBuildings/Details/0517?utm_source=aggiemap')
  })
  it('Info Header', () => {
    cy.contains(':nth-child(3) > .feature-style-1', 'Departments & Offices')
  })
  it('Department Name', () => {
    cy.contains('.department-name', 'Geography')
  })
  it('College Name', () => {
    cy.contains('.college-name', 'College Of Geosciences')
  })
  it('Building Image', () => {
    cy.get('.image > img')
      .should('have.attr', 'src', 'https://aggiemap.tamu.edu/images/compressed_test/0517.jpg')
  })
})