describe('Mouse assertions', function() {
  beforeEach(function() {
    cy.viewport(1000, 600)
    cy.visit('/')
  })

  it('Move the image with mouse', function() {
    cy.get('[data-testid=container]').dragAndDrop({ x: 50, y: 0 })
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 50, 0)')
  })

  it('Limit the left drag if too far', function() {
    cy.get('[data-testid=container]').dragAndDrop({ x: -1000, y: 0 })
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, -150.667, 0)')
  })

  it('Limit the right drag if too far', function() {
    cy.get('[data-testid=container]').dragAndDrop({ x: 1000, y: 0 })
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 150.667, 0)')
  })

  it('Mouse wheel should zoom in and out', function() {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100 })
    cy.get('img').should('have.css', 'transform', 'matrix(1.5, 0, 0, 1.5, 0, 0)')
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: 50 })
    cy.get('img').should('have.css', 'transform', 'matrix(1.25, 0, 0, 1.25, 0, 0)')
  })

  it('Move down and right after zoom', function() {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100 })
    cy.get('[data-testid=container]').dragAndDrop({ x: 50, y: 50 })
    cy.get('img').should('have.css', 'transform', 'matrix(1.5, 0, 0, 1.5, 50, 50)')
  })

  it('Move up and left after zoom', function() {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100 })
    cy.get('[data-testid=container]').dragAndDrop({ x: -50, y: -50 })
    cy.get('img').should('have.css', 'transform', 'matrix(1.5, 0, 0, 1.5, -50, -50)')
  })

  it('Limit top after zoom ', function() {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100 })
    cy.get('[data-testid=container]').dragAndDrop({ x: 0, y: -1000 })
    cy.get('img').should('have.css', 'transform', 'matrix(1.5, 0, 0, 1.5, 0, -131)')
  })

  it('Limit bottom after zoom ', function() {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100 })
    cy.get('[data-testid=container]').dragAndDrop({ x: 0, y: 1000 })
    cy.get('img').should('have.css', 'transform', 'matrix(1.5, 0, 0, 1.5, 0, 131)')
  })

  it('Keep image under crop area after zoom out', function() {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100 }) // zoom-in
    cy.get('[data-testid=container]').dragAndDrop({ x: 0, y: 1000 }) // move image to bottom
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: 100 }) // zoom-out
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 0)')
  })
})
