// in cypress/support/index.d.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />


declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to open a website and check if the API call returns data.
       * @example cy.checkApiCall('https://somewebsite.com','GET')
      */
     checkTitleLogo(): Chainable<Element>
     getFeatureToggle(): Chainable<Element>
     getDirectionsToggle(): Chainable<Element>
     getDirectionsInput(num: string): Chainable<Element>
     getSideBar(visibility: string): Chainable<Element>
     getHelpButton(): Chainable<Element>
     checkLayer(num: string, layerName: string): Chainable<Element>
     checkLegend(num: string, legendName: string): Chainable<Element>
     checkIcon(num: string, iconPath: string, altText: string): Chainable<Element>
     checkLink(elementText: string, link: string): Chainable<Element>
     containsAnyText(element: string): Chainable<Element>
    }
  }