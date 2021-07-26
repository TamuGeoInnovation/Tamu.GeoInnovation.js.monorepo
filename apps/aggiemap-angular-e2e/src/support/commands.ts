// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import * as cypress from "cypress";
import "@4tw/cypress-drag-drop";

declare namespace Cypress {
  interface Chainable<Subject> {
    login(email: string, password: string): void;
  }
}
//
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  console.log('Custom command example: Login', email, password);
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
/// <reference types="cypress" />

Cypress.Commands.add('checkTitleLogo', () => {
  cy.get('tamu-gisc-tamu-block > img')
    .should('have.attr', 'alt', 'Texas A&M University Logo')
    .and('have.attr', 'src', 'assets/images/logo/TAM-PrimaryMarkBB.svg') 
})

Cypress.Commands.add('getFeatureToggle', () => {
  cy.get('.tabs > :nth-child(1) > .esri-component')
    .should('be.visible')
    .and('have.attr', 'alt', 'Toggle Features (Search, Layers, Legend)')
    .and('have.attr', 'Title', 'Features')
    .and('have.attr', 'role', 'button')
})

Cypress.Commands.add('getDirectionsToggle', () =>{
  cy.get('.tabs > :nth-child(2) > .esri-component')
    .should('be.visible')
    .and('have.attr', 'alt', 'Toggle directions controls (routing and way-finding)')
    .and('have.attr', 'Title', 'Directions')
    .and('have.attr', 'role', 'button')
})

Cypress.Commands.add('getDirectionsInput', (num) => {
  cy.get(`:nth-child(${num}) > :nth-child(1) > .input-action-container > .margin-right`)
    .should('have.attr', 'role', 'textbox')
    .and('have.attr', 'placeholder', 'Choose point or click on the map')
})
  
Cypress.Commands.add('getSideBar', (visibility) => {
  cy.get('tamu-gisc-sidebar')
    .should(`${visibility}`)
    .and('have.class', 'right')
})

Cypress.Commands.add('checkLayer', (num, layerName) => {
  cy.get(`tamu-gisc-layer-list > .sidebar-component-content-container > :nth-child(${num})`)
    .should('have.class', 'ng-star-inserted', {timeout: 2000})
    .and('contain', `${layerName}`, {timeout: 2000})
})

Cypress.Commands.add('checkLegend', (num, legendName) => {
  cy.get(`.sidebar-component-content-container > :nth-child(${num})`)
    .should('contain', `${legendName}`)
    .and('be.visible')
})

Cypress.Commands.add('checkIcon', (num, iconPath, altText) => {
  cy.get(`:nth-child(${num}) > .image-container > img`)
    .should('have.attr', 'src', `${iconPath}`)
    .and('have.attr', 'alt', `${altText}`)
})

Cypress.Commands.add('getHelpButton', () => {
  cy.get('.help')
    .should('have.attr', 'aria-label', 'Click for map usage instructions and policies')
    .and('have.attr', 'role', 'button')
    .and('have.attr', 'title', 'Instructions and policies')
})

Cypress.Commands.add('checkLink', (elementText, link) => {
  cy.contains(elementText)
    .should('have.attr', 'href', `${link}`)
})
Cypress.Commands.add('containsAnyText', (element) => {
  cy.get(element)
    .invoke('text')
    .should('be.ok')
})
Cypress.Commands.add('checkMenuItem', (num, name) => {
  cy.get(`.list-container > :nth-child(${num})`)
    .should('contain', `${name}`)
})
// confirm pop-up appears by intercepting server request
Cypress.Commands.add('checkPopUp', () => {
  cy.get('tamu-gisc-feature-popup > .popup').should('be.visible')
})
// confirm navigation panel appears by verifying URL
Cypress.Commands.add('checkNavPanel', () => {
  cy.url().should('include','/trip')
})
// checks if icons are visible on the map
Cypress.Commands.add('checkMapIcon', () => {
  cy.get('tamu-gisc-layer-list-item > .layer-item').should('be.visible')
})
export{}
