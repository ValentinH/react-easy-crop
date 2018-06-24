describe('Basic assertions', function() {
  beforeEach(function() {
    cy.viewport(1000, 600)
    cy.visit('/')
  })
  it('Display the image and cropper with correct dimension', function() {
    cy.get('img').should('have.css', 'width', '1000px')
    cy.get('img').should('have.css', 'height', '524px')
    cy.get('[data-testid=cropper]').should('have.css', 'width', '699px') // 4/3 the height of the image
    cy.get('[data-testid=cropper]').should('have.css', 'height', '524px') // height of the image
  })
})
