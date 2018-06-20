describe('Drag assertions', function() {
  beforeEach(function() {
    cy.viewport(1000, 600)
    cy.visit('http://localhost:3001')
  })
  it('Display the image and cropper with correct dimension', function() {
    cy.get('img').should('have.css', 'width', '1000px')
    cy.get('img').should('have.css', 'height', '524px')
    cy.get('[data-testid=cropper]').should('have.css', 'width', '699px') // 4/3 the height of the image
    cy.get('[data-testid=cropper]').should('have.css', 'height', '524px') // height of the image
  })

  it('Move the image with mouse', function() {
    cy.get('[data-testid=container]').dragAndDrop({ x: 50, y: 0 })
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 50, 0)')
  })

  it('Limit the left drag if too far', function() {
    cy.get('[data-testid=container]').dragAndDrop({ x: -1000, y: 0 })
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, -150,667, 0)')
  })

  it('Limit the right drag if too far', function() {
    cy.get('[data-testid=container]').dragAndDrop({ x: 1000, y: 0 })
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 150,667, 0)')
  })

  it('Mouse wheel should zoom', function() {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100 })
    cy.get('img').should('have.css', 'transform', 'matrix(1,5, 0, 0, 1,5, 0, 0)')
  })
})
