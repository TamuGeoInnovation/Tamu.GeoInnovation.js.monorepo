context('Open Landing Page', () => {
    beforeEach(() => {
      cy.visit('https://covid.geoservices.tamu.edu/api/geocoding')
    })
    
    describe('Test Landing Page', function() {
      it('Check Landing Page', function() {
        cy.title().should('eq', 'Geoservices User Services')
        cy.location('protocol').should('eq','https:')
        cy.get('tamu-gisc-drawer').should('be.visible')
        cy.get('.active').should('contain', 'Geocoding')
      })
    
      it('Test Sidebar', function() {
        cy.get('.ng-tns-c2-0').should('be.visible').as('sideBarBtn')
        cy.get('@sideBarBtn').click()
        cy.get('tamu-gisc-drawer').should('not.be.visible')
        cy.get('@sideBarBtn').click()
      })
    })
  })
  
  context('Open Getting Started Page', () => {
    beforeEach(() => {
        cy.visit('https://covid.geoservices.tamu.edu/api/geocoding')
        cy.get('.sidebar-menu > :nth-child(1) > :nth-child(2) > :nth-child(1)')
          .should('contain', 'Getting Started').as('gettingStarted')
        cy.get('@gettingStarted').click()
        cy.get('.active').should('contain', 'Getting Started')
        cy.get('.section-header').should('contain', 'Getting Started')
        cy.url().should('contain', 'getting-started')
    })
  
    describe('Test Getting Started Page', function() {
      it('Test Overview', function() {
        cy.get('.active > :nth-child(2) > ul > [scrollto="#overview"]').as('overview')
        cy.get('@overview').click()
        cy.window().then(($window) => {expect($window.scrollY).to.be.closeTo(10, 20);}); 
      })         

      it('Test Authentication', function() {
        cy.get('.active > :nth-child(2) > ul > [scrollto="#authentication"]')
          .as('authentication')
        cy.get('@authentication').click()
        cy.get('h2').contains('Authentication').should('exist')
      })          

      it('Test Quota and Rate Limits', function() {
        cy.get('.active > :nth-child(2) > ul > [scrollto="#quota-rate-limits"]')
          .as('quota')
        cy.get('@quota').click()
        cy.get('h2').contains('Quota and Rate Limits').should('exist')
      })  

      it('Test Raw Requests', function() {
        cy.get('.active > :nth-child(2) > ul > [scrollto="#raw-requests"]')
          .as('requests')
        cy.get('@requests').click()
        cy.get('h2').contains('Raw Queries').should('exist')
        cy.get('#raw-requests > pre > .hljs').as('requestCode')
        cy.get('@requestCode').scrollTo('bottom')
      })  

      it("Test Libraries & SDK's", function() {
        cy.get('.active > :nth-child(2) > ul > [scrollto="#library-sdks"]')
          .as('library')
        cy.get('@library').click()
        cy.get('h2').contains("Libraries & SDK's").should('exist')
        cy.get(':nth-child(11) > .hljs').scrollTo('bottom')
      })  

    })
  })
  
  context('Open Geocoding Page', () => {
    beforeEach(() => {
        cy.visit('https://covid.geoservices.tamu.edu/api/geocoding')
        cy.get('.sidebar-menu > :nth-child(2) > :nth-child(2) > :nth-child(1)')
          .should('contain', 'Geocoding').as('geocoding')
        cy.get('@geocoding').click()
        cy.get('.active').should('contain', 'Geocoding')
        cy.get('.section-header').should('contain', 'Geocoding')
        cy.url().should('contain', 'geocoding')
    })
  
    describe('Test Geocoding Page', function() {
      it('Test Overview', function() {
        cy.get('.active > :nth-child(2) > ul > [scrollto="#overview"]').as('overview')
        cy.get('@overview').click()
        cy.window().then(($window) => {expect($window.scrollY).to.be.closeTo(10, 20);}); 
      })         

      it('Test Parameters', function() {
        cy.get('.active > :nth-child(2) > ul > [scrollto="#parameters"]')
          .as('parameters')
        cy.get('@parameters').click()
        cy.get('h2').contains('Parameters').should('exist')
      })          

      it('Test Response', function() {
        cy.get('.active > :nth-child(2) > ul > [scrollto="#response"]').as('quota')
        cy.get('@quota').click()
        cy.get('h2') .contains('Response').should('exist')
      })  

      it('Test Raw Requests', function() {
        cy.get('.active > :nth-child(2) > ul > [scrollto="#response"]').as('response')
        cy.get('@response').click()
        cy.get('h2').contains('Response').should('exist')

        cy.get('.ng-tns-c2-0').should('be.visible').as('sideBarBtn')
        cy.get('@sideBarBtn').click()
        cy.get('.hljs').as('codeBlock')
          
        cy.get('.tabs > :nth-child(1)').should('contain', 'JSON')
          .and('have.class', 'tab active ng-star-inserted').as('jsonCode')
        cy.get('.tabs > :nth-child(2)').should('contain', 'CSV/TSV').as('csvCode')
        cy.get('.tabs > :nth-child(3)').should('contain', 'XML').as('xmlCode')

        cy.get('@xmlCode').click().should('have.class', 'tab ng-star-inserted active')
        cy.get('@codeBlock').scrollTo('bottom')
        
        cy.get('@csvCode').click().should('have.class', 'tab ng-star-inserted active')
        cy.get('@codeBlock').scrollTo('bottom')

        cy.get('@jsonCode').click().should('have.class', 'tab ng-star-inserted active')
        cy.get('@codeBlock').scrollTo('bottom')
      })  
    })
  })