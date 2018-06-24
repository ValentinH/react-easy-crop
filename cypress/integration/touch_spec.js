describe('Touch assertions', function() {
  beforeEach(function() {
    cy.viewport(1000, 600)
    cy.visit('/')
  })

  it('Move the image with touch', function() {
    cy.get('[data-testid=container]').dragAndDropWithTouch({ x: 50, y: 0 })
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 50, 0)')
  })

  it('Limit the left drag if too far', function() {
    cy.get('[data-testid=container]').dragAndDropWithTouch({ x: -1000, y: 0 })
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, -150.667, 0)')
  })

  it('Limit the right drag if too far', function() {
    cy.get('[data-testid=container]').dragAndDropWithTouch({ x: 1000, y: 0 })
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 150.667, 0)')
  })

  it('Zoom in and out with pinch', function() {
    cy.get('[data-testid=container]').pinch({ distance: 10 })
    cy.get('img').should('have.css', 'transform', 'matrix(2, 0, 0, 2, 0, 0)')
    cy.get('[data-testid=container]').pinch({ distance: -4 })
    cy.get('img').should('have.css', 'transform', 'matrix(1.2, 0, 0, 1.2, 0, 0)')
  })
})
