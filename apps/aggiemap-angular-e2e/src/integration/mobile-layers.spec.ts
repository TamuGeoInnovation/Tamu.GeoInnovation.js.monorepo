/// <reference path="../support/index.d.ts" />
import mobileSizes from './mobile-menu.spec';
mobileSizes.forEach((size) => {
  describe(`Test Elements on Mobile Layers Page: ${size} resolution`, () => {
    beforeEach(() => {
      cy.viewport(size[0], size[1])
    })
    
  })
})
