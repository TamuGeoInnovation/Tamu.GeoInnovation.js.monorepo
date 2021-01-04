describe('Test Route', () => {
  beforeEach(() => {
    cy.intercept("GET", "**/TAMU_BaseMap/**").as("basemap")
    //cy.intercept("GET","*").as("any")
    cy.intercept("GET", "**/Routing/**").as("routing")
    cy.intercept("GET", "/geometryEngine.js").as("geo")
    cy.intercept("GET", "**/maneurvers/**").as("images")
  })
  it('Open Page', () => {
    cy.visit('https://aggiemap.tamu.edu/map/d/trip')
    cy.wait('@basemap')
  })
  it('Start Route', () => {
    cy.get('canvas')
      .should('be.visible', {timeout: 10000})
      .click(1185,618)
    cy.get(':nth-child(1) > :nth-child(1) > .input-action-container > .margin-right', {timeout: 20000})
      .should('have.value', 'Kyle Field')
  })

  it('End Route', () => {
    cy.get('canvas')
      .should('be.visible', {timeout: 10000})
      .click(1343,184)
    cy.get(':nth-child(2) > :nth-child(1) > .input-action-container > .margin-right', {timeout: 20000})
      .should('have.value', 'Jack K. Williams Administration Building')
  })
  it('Check Route is Made', () => {
    cy.wait(2000)
    cy.wait('@routing')
    cy.wait('@geo')
    cy.wait('@images')
  })
  describe('Walk Route Data', () => {
    it('Route Option Button', () => {
      cy.get('.travel-modes > :nth-child(1) > div')
        .should('contain', 'directions_walk')
        .and('have.class', 'active')
        .and('have.attr', 'title', 'Walking')
        .and('have.attr', 'alt', 'Routing Mode: Walking')
    })
    it('Time Estimate', () => {
      cy.containsAnyText('.active > .eta')
      cy.containsAnyText(':nth-child(1) > .quantity')
      cy.get(':nth-child(1) > .unit')
        .should('contain', 'Minutes')
    })
    it('Distance Estimate', () => {
      cy.containsAnyText(':nth-child(3) > .quantity')
      cy.get(':nth-child(3) > .unit')
        .should('contain', 'Miles')
    })
    it('Replay Button', () => {
      cy.get('tamu-gisc-trip-planner-directions-actions.ng-star-inserted > :nth-child(1) > :nth-child(1) > .material-icons')
        .should('contain', 'replay')
      cy.get('tamu-gisc-trip-planner-directions-actions.ng-star-inserted > :nth-child(1) > :nth-child(1) > p')
        .should('contain', 'Start Over')
    })
    it('Share Button', () => {
      cy.get('.copy-button > .material-icons')
        .should('contain', 'share')
      cy.get('.copy-button > p')
        .should('contain', 'Share')
    })
    it('Feedback Button', () => {
      cy.get(':nth-child(5) > .material-icons')
        .should('contain', 'thumbs_up_down')
      cy.get('tamu-gisc-trip-planner-directions-actions.ng-star-inserted > :nth-child(1) > :nth-child(5) > p')
        .should('contain', 'Feedback')
    })
    it('Directions', () => {
      cy.get('.directions-container')
        .should('contain', 'Start at Kyle Field')
        .and('contain', 'Sidewalk')
        .and('contain', 'Finish at Jack K. Williams Administration Building')
      cy.get(':nth-child(1) > tamu-gisc-trip-planner-mode-switch > .mode-icon')
        .should('contain', 'directions_walk')
    })
  })
  describe('Bike Route Data', () => {
    it('Change to Bike Route', () => {
      cy.get('.travel-modes > :nth-child(2) > div')
        .should('contain', 'directions_bike')
        .and('not.have.class', 'active')
        .and('have.attr', 'title', 'Biking')
        .and('have.attr', 'alt', 'Routing Mode: Biking')
      cy.get('.travel-modes > :nth-child(2) > div')
        .click()
        .should('have.class', 'active')
    })
    it('Time Estimate', () => {
      cy.containsAnyText('.active > .eta')
      cy.containsAnyText(':nth-child(1) > .quantity')
      cy.get(':nth-child(1) > .unit')
        .should('contain', 'Minutes')
    })
    it('Distance Estimate', () => {
      cy.containsAnyText(':nth-child(3) > .quantity')
      cy.get(':nth-child(3) > .unit')
        .should('contain', 'Miles')
    })
    it('Directions', () => {
      cy.get('.directions-container')
        .should('contain', 'Start at Kyle Field')
        .and('contain', 'Sidewalk')
        .and('contain', 'Finish at Jack K. Williams Administration Building')
      cy.get(':nth-child(2) > tamu-gisc-trip-planner-mode-switch > .mode-icon')
        .should('contain', 'directions_bike')
    })
  })
  describe('Car Route Data', () => {
    it('Change to Car Route', () => {
      cy.get('.travel-modes > :nth-child(3) > div')
        .should('contain', 'directions_car')
        .and('not.have.class', 'active')
        .and('have.attr', 'title', 'Driving')
        .and('have.attr', 'alt', 'Routing Mode: Driving')
      cy.get('.travel-modes > :nth-child(3) > div')
        .click()
        .should('have.class', 'active')
    })
    it('Time Estimate', () => {
      cy.containsAnyText('.active > .eta')
      cy.containsAnyText(':nth-child(1) > .quantity')
      cy.get(':nth-child(1) > .unit')
        .should('contain', 'Minutes')
    })
    it('Distance Estimate', () => {
      cy.containsAnyText(':nth-child(3) > .quantity')
      cy.get(':nth-child(3) > .unit')
        .should('contain', 'Miles')
    })
    it('Directions', () => {
      cy.get('.directions-container')
        .should('contain', 'Start at Kyle Field')
        .and('contain', 'Finish at Jack K. Williams Administration Building')
      cy.get(':nth-child(2) > tamu-gisc-trip-planner-mode-switch > .mode-icon')
        .should('contain', 'directions_car')
    })
  })
  describe('Bus Route Data', () => {
    it('Change to Bus Route', () => {
      cy.get('.travel-modes > :nth-child(4) > div')
        .should('contain', 'directions_bus')
        .and('not.have.class', 'active')
        .and('have.attr', 'title', 'Bus')
        .and('have.attr', 'alt', 'Routing Mode: Bus')
      cy.get('.travel-modes > :nth-child(4) > div')
        .click()
        .should('have.class', 'active')
    })
    it('Time Estimate', () => {
      cy.containsAnyText('.active > .eta')
      cy.containsAnyText(':nth-child(1) > .quantity')
      cy.get(':nth-child(1) > .unit')
        .should('contain', 'Minutes')
    })
    it('Distance Estimate', () => {
      cy.containsAnyText(':nth-child(3) > .quantity')
      cy.get(':nth-child(3) > .unit')
        .should('contain', 'Miles')
    })
    it('Directions', () => {
      cy.get('.directions-container')
        .should('contain', 'Start at Kyle Field')
        .and('contain', 'Finish at Jack K. Williams Administration Building')
      cy.get(':nth-child(2) > tamu-gisc-trip-planner-mode-switch > .mode-icon')
        .should('contain', 'directions_bus')
    })
  })
})