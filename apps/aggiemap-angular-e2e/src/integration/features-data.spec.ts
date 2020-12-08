describe('Correct Page', function() {
  beforeEach(() => {
    cy.visit('https://aggiemap.tamu.edu/map/d')
  })
  it('Check Location', () => {
    cy.location('protocol')
      .should('eq', 'https:')
  }) 
  it('Title', () => {
    cy.title().should('eq', 'Aggie Map - Texas A&M University')
  })
  it('Sidebar', () => {
    cy.get('tamu-gisc-sidebar')
    .should('be.visible')
    .and('have.attr', 'style', 'width: 22.5rem; transform: translateX(0px);')
    .and('have.class', 'right')
  })
  it('Directions Toggle', () => {
    cy.get('.tabs > :nth-child(2) > .esri-component')
    .should('be.visible')
    .and('have.attr', 'alt', 'Toggle directions controls (routing and way-finding)')
    .and('have.attr', 'Title', 'Directions')
    .and('have.attr', 'role', 'button')
  })
  it('Feature Toggle', () => {
    cy.get('.tabs > :nth-child(1) > .esri-component')
    .should('be.visible')
    .and('have.attr', 'alt', 'Toggle Features (Search, Layers, Legend)')
    .and('have.attr', 'Title', 'Features')
    .and('have.attr', 'role', 'button')
  })
  it('Headings', () => {
    cy.contains('tamu-gisc-layer-list > .sidebar-component-name', 'Layers')
    cy.contains('tamu-gisc-legend > .sidebar-component-name', 'Legend')
  });
});