describe('Iframed assertions', function () {
  beforeEach(function () {
    cy.viewport(1000, 600)
    cy.visit('/?iframed=true')
  })

  const getIframeBody = () => {
    return cy
      .get('iframe[data-cy="iframe"]')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(cy.wrap)
  }

  it('Display the crop area with correct styles applied to the iframe', () => {
    getIframeBody()
      .find('.reactEasyCrop_CropArea')
      .should('exist')
      .should('have.css', 'color')
      .and('eq', 'rgba(0, 0, 0, 0.5)')
  })
})
